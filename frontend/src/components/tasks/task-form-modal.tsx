"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ListChecks } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/hooks";
import { useToast } from "@/lib/toast-context";
import type { Task, TaskInput, TaskStatus, UserRecord } from "@/lib/types";
import {
  ROLE_META,
  STATUS_META,
  TASK_STATUSES,
  assigneeId,
  getErrorMessage,
  toDateTimeLocal,
} from "@/lib/utils";

function defaultDeadline() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(17, 0, 0, 0);
  return toDateTimeLocal(date.toISOString());
}

export function TaskFormModal({
  open,
  onClose,
  task,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  onSaved?: (task: Task) => void;
}) {
  const toast = useToast();
  const { user } = useAuth();
  const editing = Boolean(task);
  const { users, loading: usersLoading, error: usersError } = useUsers(open);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The directory endpoint excludes the signed-in user, so merge them back in
  // to allow self-assignment. Active members are listed first.
  const assignees = useMemo(() => {
    const seen = new Set<string>();
    const list: UserRecord[] = [];
    const push = (member: UserRecord | null | undefined) => {
      if (!member?.id || seen.has(member.id)) return;
      seen.add(member.id);
      list.push(member);
    };
    push(user);
    users.forEach(push);
    return list.sort((a, b) => {
      if (Boolean(a.status) !== Boolean(b.status)) return a.status ? -1 : 1;
      return a.username.localeCompare(b.username);
    });
  }, [users, user]);

  const missingAssignee =
    Boolean(assignedTo) && !assignees.some((member) => member.id === assignedTo);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDeadline(toDateTimeLocal(task.deadline) || defaultDeadline());
      setStatus(task.status);
      setAssignedTo(assigneeId(task) || user?.id || "");
    } else {
      setTitle("");
      setDescription("");
      setDeadline(defaultDeadline());
      setStatus("todo");
      setAssignedTo(user?.id || "");
    }
  }, [open, task, user?.id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !deadline) {
      setError("Title, description, and deadline are all required.");
      return;
    }
    if (!assignedTo) {
      setError("Choose the workspace member this task is assigned to.");
      return;
    }
    if (title.trim().length > 30) {
      setError("Keep the title at 30 characters or fewer.");
      return;
    }
    if (description.trim().length > 500) {
      setError("Keep the description at 500 characters or fewer.");
      return;
    }
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) {
      setError("Enter a valid deadline.");
      return;
    }
    if (date.getTime() <= Date.now()) {
      setError("The deadline needs to be in the future.");
      return;
    }

    const payload: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      deadline: date.toISOString(),
      status,
      assignedTo,
    };

    setSubmitting(true);
    try {
      const saved = editing && task
        ? await api.updateTask(task._id, payload)
        : await api.createTask(payload);
      toast.success(editing ? "Task updated" : "Task created", saved?.title ?? payload.title);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, editing ? "Could not update the task" : "Could not create the task"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "Create a task"}
      description={
        editing
          ? "Update the details and save your changes to the API."
          : "Give the work a clear title, an owner-ready description, a deadline, and an assignee."
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" size="sm" loading={submitting}>
            {editing ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <Alert variant="error" title="Check the form">
            {error}
          </Alert>
        ) : null}

        <Field
          label="Title"
          htmlFor="task-title"
          required
          hint={`${title.length}/30 characters`}
        >
          <TextInput
            id="task-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Finalize the sprint review"
            leadingIcon={<ListChecks className="size-4" />}
            maxLength={40}
            invalid={title.length > 30}
            autoFocus
          />
        </Field>

        <Field
          label="Description"
          htmlFor="task-description"
          required
          hint={`${description.length}/500 characters`}
        >
          <TextArea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What needs to happen, and what does done look like?"
            rows={4}
            invalid={description.length > 500}
          />
        </Field>

        <Field
          label="Assignee"
          htmlFor="task-assignee"
          required
          hint={
            usersError ??
            "The API requires every task to have an assigned workspace member."
          }
        >
          <Select
            id="task-assignee"
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            disabled={submitting || usersLoading}
            invalid={Boolean(usersError)}
          >
            <option value="">
              {usersLoading ? "Loading members..." : "Select a team member"}
            </option>
            {missingAssignee ? (
              <option value={assignedTo}>Unknown member</option>
            ) : null}
            {assignees.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username}
                {member.id === user?.id ? " (you)" : ""}
                {member.status === false ? " · pending" : ""}
                {member.role ? ` · ${ROLE_META[member.role].label}` : ""}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Deadline" htmlFor="task-deadline" required>
            <TextInput
              id="task-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              leadingIcon={<CalendarClock className="size-4" />}
            />
          </Field>

          <Field label="Status" htmlFor="task-status" required>
            <Select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {STATUS_META[value].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <p className="text-[11px] leading-relaxed text-muted">
          The API stores the deadline as a string, requires a future date, and
          requires every task to be assigned to a member. Validation here mirrors
          that contract.
        </p>
      </form>
    </Modal>
  );
}
