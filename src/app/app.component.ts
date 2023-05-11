import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  model: cocoSsd.ObjectDetection | any;
  ctx!: CanvasRenderingContext2D | any;
  objects: DetectedObject[] = [];
  videoEl!: any;
  canvasEl!: any;

  async ngOnInit() {
    // Obtener los elementos del DOM
    this.videoEl = this.video.nativeElement;
    this.canvasEl = this.canvas.nativeElement;
    this.ctx = this.canvasEl.getContext('2d');
    if (Capacitor.isNativePlatform()) {
      this.startMobileCamera();
    } else {
      this.startWebCamera();
    }

    // Cargar el modelo coco-ssd
    this.model = await cocoSsd.load();
  }

  async startMobileCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: Capacitor.getPlatform() === 'android' ? undefined : 640,
        height: Capacitor.getPlatform() === 'android' ? undefined : 480,
      },
    });
    // this.video.nativeElement.srcObject = stream;

    this.videoEl.srcObject = stream;

    // Esperar a que el metadata del video esté cargado
    this.videoEl.onloadedmetadata = () => {
      // Establecer el tamaño del canvas igual al del video
      this.canvasEl.width = this.videoEl.videoWidth;
      this.canvasEl.height = this.videoEl.videoHeight;

      // Iniciar la detección de objetos
      this.detectObjects();
    };

    // this.ctx = this.canvas.nativeElement.getContext('2d');
  }

  async startWebCamera() {
    // Obtener el stream del video
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Asignar el stream al elemento video
    this.videoEl.srcObject = stream;

    // Esperar a que el metadata del video esté cargado
    this.videoEl.onloadedmetadata = () => {
      // Establecer el tamaño del canvas igual al del video
      this.canvasEl.width = this.videoEl.videoWidth;
      this.canvasEl.height = this.videoEl.videoHeight;

      // Iniciar la detección de objetos
      this.detectObjects();
    };
  }

  async detectObjects() {
    // Obtener el elemento de video y dibujarlo en el canvas
    const videoEl = this.video.nativeElement;
    this.ctx.drawImage(videoEl, 0, 0);

    // Hacer la predicción con el modelo coco-ssd
    const predictions: DetectedObject[] = await this.model.detect(videoEl);
    const colors = [
      'rgba(255, 0, 0, 0.3)',
      'rgba(0, 255, 0, 0.3)',
      'rgba(0, 0, 255, 0.3)',
      'rgba(255, 255, 0, 0.3)',
      'rgba(255, 0, 255, 0.3)',
    ];

    // Dibujar los rectángulos en el canvas
    predictions.forEach((prediction, i) => {
      const color = colors[i % colors.length];
      const [x, y, width, height] = prediction.bbox;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.fillStyle = color;
    });

    this.ctx.font = '20px Arial';

    this.objects = predictions;
    this.objects.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      if (prediction.class !== 'person') {
        this.ctx.beginPath();
        this.ctx.rect(...prediction.bbox);
        this.ctx.lineWidth = 2;
        /* this.ctx.strokeStyle = 'green';
        this.ctx.fillStyle = 'green'; */

        // this.ctx.fillRect(x, y, width, height);
        // this.ctx.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 5);

        this.ctx.fillText(
          prediction.class + ' - ' + Math.round(prediction.score * 100) + '%',
          x,
          y > width ? y - 5 : y + height
        );
      }
    });

    // Volver a llamar a la detección de objetos
    requestAnimationFrame(() => this.detectObjects());
  }
}
