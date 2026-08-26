import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { HeroDiveService } from '../../services/hero-dive.service';

const VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying float vLip;
varying float vAlong;
varying float vFrac;
uniform float uTime;
uniform vec2 uMouse;

float heightAt(vec2 p) {
  vec2 c = p - uMouse * 0.42;
  float r = length(c);
  float ang = atan(c.y, c.x);
  float warp = sin(ang * 3.0 + 0.4) * 0.22
    + sin(ang * 5.0 - 1.0) * 0.1
    + sin(ang * 9.0 + uTime * 0.08) * 0.045
    + sin(ang * 2.0 + 1.6) * 0.06;
  float rw = r + warp * smoothstep(0.5, 2.8, r);
  float wellR = 12.6;
  float t = clamp(rw / wellR, 0.0, 1.0);
  float steps = 28.0;
  float n = t * steps;
  float f = fract(n);
  float riser = smoothstep(0.0, 0.07, f);
  float tStep = (floor(n) + riser) / steps;
  float y = -(1.0 - tStep) * 30.0;
  float apron = smoothstep(wellR - 0.2, wellR + 2.4, r);
  y = mix(y, 0.03 * sin(p.x * 0.5) * sin(p.y * 0.45), apron);
  y -= (1.0 - smoothstep(0.1, 0.9, rw)) * 6.0;
  return y;
}

void main() {
  vec3 pos = position;
  float h = heightAt(pos.xz);
  pos.y = h;

  float e = 0.06;
  float hx = heightAt(pos.xz + vec2(e, 0.0));
  float hz = heightAt(pos.xz + vec2(0.0, e));
  vec3 nrm = normalize(cross(
    vec3(0.0, hz - h, e),
    vec3(e, hx - h, 0.0)
  ));

  vec2 c = pos.xz - uMouse * 0.42;
  float r = length(c);
  float ang = atan(c.y, c.x);
  float warp = sin(ang * 3.0 + 0.4) * 0.22 + sin(ang * 5.0 - 1.0) * 0.1;
  float rw = r + warp * smoothstep(0.5, 2.8, r);
  float t = clamp(rw / 12.6, 0.0, 1.0);
  float f = fract(t * 28.0);

  vLip = 1.0 - smoothstep(0.0, 0.05, f);
  vAlong = t;
  vFrac = f;
  vNormal = normalize(normalMatrix * nrm);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying float vLip;
varying float vAlong;
varying float vFrac;
uniform float uTime;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float ndl = max(dot(n, normalize(vec3(0.5, 0.9, 0.28))), 0.0);
  float fres = pow(1.0 - abs(dot(n, v)), 3.1);
  float slope = 1.0 - abs(n.y);
  float ao = mix(0.28, 1.0, smoothstep(0.0, 0.35, vFrac));

  vec3 ivory = vec3(0.93, 0.9, 0.84);
  vec3 shade = vec3(0.2, 0.2, 0.21);
  vec3 base = mix(shade, ivory, 0.42 + ndl * 0.58) * ao;

  float hue = fract(vAlong * 0.16 + uTime * 0.015);
  vec3 rainbow = hsv2rgb(vec3(hue, 0.78, 1.0));
  float edge = vLip * (0.55 + slope * 0.45 + fres * 0.25);
  vec3 col = mix(base, rainbow, edge);

  col = mix(col, vec3(0.05, 0.05, 0.055), smoothstep(0.24, 0.0, vAlong) * 0.82);

  gl_FragColor = vec4(col, 1.0);
}
`;

@Component({
  selector: 'app-hero-field',
  templateUrl: './hero-field.component.html',
  styleUrls: ['./hero-field.component.scss'],
})
export class HeroFieldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  failed = false;
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private mesh?: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private pit?: THREE.Mesh;
  private frame = 0;
  private reduced = false;
  private pointer = { x: 0, y: 0 };
  private target = { x: 0, y: 0 };
  private lastW = 0;
  private lastH = 0;
  private ro?: ResizeObserver;
  private onMove = (e: PointerEvent) => this.handleMove(e);

  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
    private dive: HeroDiveService
  ) {}

  ngAfterViewInit(): void {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.zone.runOutsideAngular(() => this.boot());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
    this.ro?.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    this.mesh?.geometry.dispose();
    this.mesh?.material.dispose();
    this.pit?.geometry.dispose();
    (this.pit?.material as THREE.Material | undefined)?.dispose();
    this.renderer?.dispose();
  }

  private makeWellGeometry(radial: number, segs: number): THREE.BufferGeometry {
    const wellR = 16.5;
    const rings = radial + 1;
    const circ = segs + 1;
    const pos = new Float32Array(rings * circ * 3);
    let p = 0;
    for (let i = 0; i <= radial; i++) {
      const t = i / radial;
      const r = Math.pow(t, 0.82) * wellR;
      for (let j = 0; j <= segs; j++) {
        const a = (j / segs) * Math.PI * 2;
        pos[p++] = Math.cos(a) * r;
        pos[p++] = 0;
        pos[p++] = Math.sin(a) * r;
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < radial; i++) {
      for (let j = 0; j < segs; j++) {
        const a = i * circ + j;
        const b = a + circ;
        idx.push(a, a + 1, b, a + 1, b + 1, b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(idx);
    return geo;
  }

  private boot(): void {
    const canvas = this.canvasRef.nativeElement;
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      this.failed = true;
      return;
    }

    this.renderer.setClearColor(0xe4dfd6, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 70);

    const radial = window.innerWidth < 768 ? 90 : 140;
    const segs = window.innerWidth < 768 ? 140 : 220;
    const geo = this.makeWellGeometry(radial, segs);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.mesh);

    const pit = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 64),
      new THREE.MeshBasicMaterial({ color: 0x070708 })
    );
    pit.rotation.x = -Math.PI / 2;
    pit.position.y = -34;
    this.scene.add(pit);
    this.pit = pit;

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.host.nativeElement);
    window.addEventListener('pointermove', this.onMove, { passive: true });
    this.tick(0);
  }

  private resize(): void {
    if (!this.renderer || !this.camera) {
      return;
    }
    const el = this.host.nativeElement;
    const w = Math.max(el.clientWidth, 1);
    const h = Math.max(el.clientHeight, 1);
    if (w === this.lastW && h === this.lastH) {
      return;
    }
    this.lastW = w;
    this.lastH = h;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private handleMove(e: PointerEvent): void {
    this.target.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.target.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  private tick = (time: number): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.mesh) {
      return;
    }
    this.resize();
    this.pointer.x += (this.target.x - this.pointer.x) * 0.045;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.045;

    const t = this.reduced ? 0 : this.dive.progress;
    const d = t * t * (3 - 2 * t);
    const y = 8.1 + (-15.2 - 8.1) * Math.pow(d, 0.68);
    const z = 10.2 * Math.pow(1 - d, 1.85);
    const sway = 1.15 * (1 - d * 0.96);

    this.camera.position.set(
      this.pointer.x * sway * (1 - d * 0.75),
      y,
      z + this.pointer.y * sway * 0.2 * (1 - d)
    );
    this.camera.lookAt(this.pointer.x * 0.1 * (1 - d), y - 11.2 - d * 7.5, 0);
    this.camera.fov = 40 + d * 42;
    this.camera.updateProjectionMatrix();

    const mat = this.mesh.material;
    mat.uniforms['uTime'].value = this.reduced ? 0 : time * 0.001;
    (mat.uniforms['uMouse'].value as THREE.Vector2).set(this.pointer.x * 0.9, this.pointer.y * 0.9);
    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };
}
