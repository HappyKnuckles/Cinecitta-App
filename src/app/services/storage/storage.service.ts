// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class StorageService {

//   constructor() { }

//   setLocalStorage(key: string, value: any): void {
//     const data = {
//       value,
//       timestamp: new Date().getTime(),
//     };
//     localStorage.setItem(key, JSON.stringify(data));
//   }

//   getLocalStorage(key: string, maxAge: number): any | null {
//     const data = localStorage.getItem(key);
//     if (data) {
//       const parsedData = JSON.parse(data);
//       const age = new Date().getTime() - parsedData.timestamp;
//       if (age < maxAge) {
//         return parsedData.value;
//       }
//     }
//     return null;
//   }
// }

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  async setLocalStorage(key: string, value: any): Promise<void> {
    const data = {
      value,
      timestamp: new Date().getTime(),
    };
    await this.storage.set(key, data);
  }

  async getLocalStorage(key: string, maxAge: number): Promise<any | null> {
    const data = await this.storage.get(key);
    if (data) {
      const age = new Date().getTime() - data.timestamp;
      if (age < maxAge) {
        return data.value;
      }
    }
    return null;
  }
}