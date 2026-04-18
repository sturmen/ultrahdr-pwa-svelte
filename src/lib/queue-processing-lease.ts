export type QueueTokenAcquireResult = {
  acquired: boolean;
  existingLaunchToken: string | null;
};

export type QueueTaskRunStarted<T> = {
  status: 'started';
  promise: Promise<T>;
};

export type QueueTaskRunJoined<T> = {
  status: 'joined';
  promise: Promise<T>;
  existingLaunchToken: string;
};

export type QueueTaskRunBlocked = {
  status: 'blocked';
  existingLaunchToken: string;
};

export type QueueTaskRunResult<T> =
  | QueueTaskRunStarted<T>
  | QueueTaskRunJoined<T>
  | QueueTaskRunBlocked;

export function createQueueTokenRegistry() {
  const activeTokens = new Map<number, string>();

  return {
    acquire(queueId: number, launchToken: string): QueueTokenAcquireResult {
      const existingLaunchToken = activeTokens.get(queueId) ?? null;
      if (existingLaunchToken !== null) {
        return {
          acquired: false,
          existingLaunchToken,
        };
      }
      activeTokens.set(queueId, launchToken);
      return {
        acquired: true,
        existingLaunchToken: null,
      };
    },

    release(queueId: number, launchToken: string): void {
      if (activeTokens.get(queueId) === launchToken) {
        activeTokens.delete(queueId);
      }
    },
  };
}

export function createQueueTaskRegistry<T>() {
  const activeTasks = new Map<number, { launchToken: string; promise: Promise<T> }>();

  return {
    run(
      queueId: number,
      launchToken: string,
      factory: () => Promise<T>,
    ): QueueTaskRunResult<T> {
      const existingTask = activeTasks.get(queueId) ?? null;
      if (existingTask) {
        if (existingTask.launchToken === launchToken) {
          return {
            status: 'joined',
            promise: existingTask.promise,
            existingLaunchToken: existingTask.launchToken,
          };
        }
        return {
          status: 'blocked',
          existingLaunchToken: existingTask.launchToken,
        };
      }

      let promise: Promise<T>;
      try {
        promise = factory();
      } catch (error) {
        promise = Promise.reject(error);
      }
      promise = promise
        .finally(() => {
          const activeTask = activeTasks.get(queueId);
          if (activeTask?.launchToken === launchToken) {
            activeTasks.delete(queueId);
          }
        });
      activeTasks.set(queueId, { launchToken, promise });
      return {
        status: 'started',
        promise,
      };
    },
  };
}
