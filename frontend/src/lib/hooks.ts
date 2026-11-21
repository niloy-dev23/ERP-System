"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Task, UserRecord } from "./types";
import { getErrorMessage } from "./utils";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getTasks();
      if (alive.current) {
        setTasks(data);
        setError(null);
      }
    } catch (err) {
      if (alive.current) setError(getErrorMessage(err, "Could not load tasks"));
    } finally {
      if (alive.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  return { tasks, loading, error, refresh: load, setTasks };
}

export function useUsers(enabled = true) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getUsers();
      if (alive.current) {
        setUsers(data);
        setError(null);
      }
    } catch (err) {
      if (alive.current) setError(getErrorMessage(err, "Could not load the team"));
    } finally {
      if (alive.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load, enabled]);

  return { users, loading, error, refresh: load, setUsers };
}

export function useApiHealth() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let active = true;
    const check = async () => {
      const online = await api.healthCheck();
      if (active) setStatus(online ? "online" : "offline");
    };
    check();
    const interval = window.setInterval(check, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return status;
}
