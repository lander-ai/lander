import { instanceToPlain } from "class-transformer";
import { Thread, ThreadMessage } from "~/models";
import { LanderDatabase } from "~/util/lander.database";

export class ThreadService {
  static shared = new ThreadService();

  private db = LanderDatabase.shared.thread;

  async getAll() {
    const data = await this.db.orderBy("updated_at").reverse().toArray();

    return data.map((thread) => {
      thread.messages = thread.messages.map(
        (message) => new ThreadMessage(message)
      );
      return new Thread(thread);
    });
  }

  async upsertThread(data: Thread) {
    const thread = {
      ...(instanceToPlain(data, { groups: ["local"] }) as Thread),
      created_at: data.createdAt,
      updated_at: new Date(),
    };

    const existingThread = await this.db.get({ id: data.id });

    if (existingThread) {
      await this.db.update(data, thread);
    } else {
      await this.db.add(thread);
    }
  }

  async remove(id: string) {
    await this.db.delete(id);
  }

  async removeAll() {
    await this.db.clear();
  }
}
