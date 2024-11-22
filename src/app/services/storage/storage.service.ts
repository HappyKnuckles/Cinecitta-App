import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  async save(key: string, value: any): Promise<void> {
    await this.storage.set(key, value);
  }

  async removeAllOldScrapeData(): Promise<void> {
    await this.storage.forEach((value, key) => {
      if (key.startsWith('de')) {
        if (value.expirationDate < new Date()) {
          this.storage.remove(key);
        }
      }
    });
  }

  async get(key: string): Promise<any> {
    return await this.storage.get(key);
  }

  async setLocalStorage(key: string, value: any): Promise<void> {
    const data = {
      value,
      timestamp: new Date().getTime(),
    };
    await this.storage.set(key, data);
  }

  async getLocalStorage(key: string, maxAge: number, hasInternet: boolean): Promise<any | null> {
    const data = await this.storage.get(key);
    if (data) {
      if (!hasInternet) {
        return data.value;
      }
      const age = new Date().getTime() - data.timestamp;
      if (age < maxAge) {
        return data.value;
      }
    }
    return null;
  }
}
