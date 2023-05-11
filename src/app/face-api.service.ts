import { EventEmitter, Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root',
})
export class FaceApiService {
  public globalFace: any;
  private modelLoaded = false;

  private modelsForLoad = [
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
  ];
  cbModels: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.globalFace = faceapi;
    this.loadModels();
  }

  /*   async loadModels() {
    await Promise.all(this.modelsForLoad);
    this.modelLoaded = true;
  } */

  public loadModels = () => {
    Promise.all(this.modelsForLoad).then(() => {
      console.log('Modelos cargados!!');
      this.cbModels.emit(true);
      this.modelLoaded = true;
    });
  };

  async detectFace(canvas: HTMLCanvasElement) {
    if (!this.modelLoaded) {
      await this.loadModels();
    }
    const result = await faceapi
      .detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return result;
  }
}
