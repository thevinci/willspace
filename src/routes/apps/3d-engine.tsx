import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AppsLeftBar } from "@/components/pages/apps/AppsLeftBar";
import * as THREE from "three";

export const Route = createFileRoute("/apps/3d-engine")({
  component: RouteComponent,
});

type Preset = "facade" | "scan" | "pulse";

const presets: { id: Preset; label: string }[] = [
  { id: "facade", label: "Facade" },
  { id: "scan", label: "Scan" },
  { id: "pulse", label: "Pulse" },
];

function GaussianField({
  density,
  paused,
  preset,
}: {
  density: number;
  paused: boolean;
  preset: Preset;
}) {
  const field = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const count = 8500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    const concrete = new THREE.Color("#a9c7d9");
    const glass = new THREE.Color("#55d9f4");
    const litWindow = new THREE.Color("#ffd881");
    const landscaping = new THREE.Color("#b6efcf");

    for (let index = 0; index < count; index += 1) {
      const positionIndex = index * 3;
      const distribution = Math.random();
      let x = 0;
      let y = 0;
      let z = 0;
      let color = concrete;

      if (distribution < 0.3) {
        // Main tower facade facing the viewer.
        x = (Math.random() - 0.5) * 3.5;
        y = Math.random() * 7 - 3.5;
        z = 1.45;
        color = Math.random() > 0.32 ? glass : concrete;
      } else if (distribution < 0.52) {
        // Side walls give the tower its volume as the viewer orbits.
        const side = Math.random() > 0.5 ? 1 : -1;
        x = side * 1.75;
        y = Math.random() * 7 - 3.5;
        z = (Math.random() - 0.5) * 2.9;
        color = glass;
      } else if (distribution < 0.72) {
        // Lower wings make the scan read as a recognizable building, not a box.
        const wing = Math.random() > 0.5 ? 1 : -1;
        x = wing * (2.4 + Math.random() * 1.5);
        y = Math.random() * 3.3 - 3.5;
        z = 0.9 + (Math.random() - 0.5) * 1.15;
        color = Math.random() > 0.45 ? glass : concrete;
      } else if (distribution < 0.85) {
        // A recessed, irregular roofline crowns the central tower.
        const roofRadius = Math.sqrt(Math.random()) * 1.9;
        const roofAngle = Math.random() * Math.PI * 2;
        x = Math.cos(roofAngle) * roofRadius;
        y = 3.5 + Math.sin(roofAngle * 3) * 0.12;
        z = Math.sin(roofAngle) * roofRadius * 0.74;
        color = concrete;
      } else if (distribution < 0.94) {
        // Window sparks sit just beyond the facade for depth and contrast.
        x = (Math.round((Math.random() - 0.5) * 10) / 10) * 3.25;
        y = (Math.round(Math.random() * 13) / 13) * 6.1 - 3.12;
        z = 1.49;
        color = litWindow;
      } else {
        // A sparse plaza anchors the structure in space.
        x = (Math.random() - 0.5) * 11;
        y = -3.58 + (Math.random() - 0.5) * 0.08;
        z = (Math.random() - 0.5) * 7;
        color = landscaping;
      }

      positions[positionIndex] = x + (Math.random() - 0.5) * 0.045;
      positions[positionIndex + 1] = y + (Math.random() - 0.5) * 0.045;
      positions[positionIndex + 2] = z + (Math.random() - 0.5) * 0.045;
      colors[positionIndex] = color.r;
      colors[positionIndex + 1] = color.g;
      colors[positionIndex + 2] = color.b;
      scales[index] =
        color === litWindow ? 7 + Math.random() * 8 : 2.8 + Math.random() * 5.5;
      seeds[index] = Math.random();
    }

    const nextGeometry = new THREE.BufferGeometry();
    nextGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    nextGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    nextGeometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    nextGeometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return nextGeometry;
  }, []);

  const presetIndex = presets.findIndex((item) => item.id === preset);

  useFrame((state) => {
    if (!field.current || !material.current || paused) return;
    field.current.rotation.y = state.clock.elapsedTime * 0.055;
    field.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.14;
    material.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points ref={field} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uDensity: { value: density },
          uPreset: { value: presetIndex },
        }}
        vertexShader={`
          attribute vec3 aColor;
          attribute float aScale;
          attribute float aSeed;
          uniform float uTime;
          uniform float uPreset;
          varying vec3 vColor;
          varying float vSeed;

          void main() {
            vec3 transformed = position;
            float ripple = sin(uTime * 0.8 + aSeed * 18.0 + position.y * 1.6);
            if (uPreset < 0.5) {
              transformed.z += ripple * 0.018;
            } else if (uPreset < 1.5) {
              float scanline = sin(position.y * 9.0 - uTime * 3.4 + aSeed * 8.0);
              transformed.z += max(scanline, 0.0) * (0.06 + aSeed * 0.13);
            } else {
              transformed.z += ripple * (0.03 + aSeed * 0.06);
            }
            vec4 modelPosition = modelViewMatrix * vec4(transformed, 1.0);
            gl_Position = projectionMatrix * modelPosition;
            gl_PointSize = aScale * (74.0 / -modelPosition.z);
            vColor = aColor;
            vSeed = aSeed;
          }
        `}
        fragmentShader={`
          uniform float uDensity;
          varying vec3 vColor;
          varying float vSeed;

          void main() {
            if (vSeed > uDensity) discard;
            vec2 center = gl_PointCoord - 0.5;
            float distanceSquared = dot(center, center);
            float gaussian = exp(-distanceSquared * 18.0);
            float halo = exp(-distanceSquared * 4.6) * 0.22;
            float alpha = (gaussian + halo) * (0.45 + vSeed * 0.55);
            gl_FragColor = vec4(vColor * (gaussian * 1.6 + halo), alpha);
          }
        `}
      />
    </points>
  );
}

function RouteComponent() {
  const [density, setDensity] = useState(0.84);
  const [paused, setPaused] = useState(false);
  const [preset, setPreset] = useState<Preset>("facade");
  const [sceneKey, setSceneKey] = useState(0);

  return (
    <div className="flex flex-1 min-h-0">
      <AppsLeftBar />
      <main className="relative flex flex-1 min-h-0 overflow-hidden bg-[#090b13] text-white">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_46%,transparent_0%,rgba(5,7,12,0.15)_43%,rgba(5,7,12,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 opacity-30 [background-image:linear-gradient(rgba(166,213,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(166,213,255,0.07)_1px,transparent_1px)] [background-size:52px_52px]" />

        <Canvas
          key={sceneKey}
          className="absolute inset-0"
          camera={{ position: [8.5, 4.2, 11.5], fov: 48 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#090b13"]} />
          <fog attach="fog" args={["#090b13", 8, 19]} />
          <GaussianField density={density} paused={paused} preset={preset} />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            target={[0, -0.4, 0]}
            autoRotate={!paused}
            autoRotateSpeed={0.3}
          />
        </Canvas>

        <section className="pointer-events-none relative z-20 flex w-full flex-col justify-between p-5 sm:p-8">
          <header className="flex items-start justify-between gap-4">
            <div className="max-w-sm animate-in fade-in slide-in-from-top-3 duration-700">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.24em] text-cyan-200/75">
                ARCHITECTURAL CAPTURE 01
              </p>
              <h1 className="font-[Space_Grotesk] text-3xl font-medium tracking-normal text-white sm:text-5xl">
                Atrium No. 4
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300/75">
                A reconstructed building formed from 8,500 Gaussian splats. Drag
                to orbit around the capture.
              </p>
            </div>
            <div className="hidden border border-white/15 bg-black/20 px-3 py-2 text-right backdrop-blur-md sm:block">
              <p className="text-[10px] font-medium tracking-[0.15em] text-slate-400">
                PARTICLES
              </p>
              <p className="mt-0.5 font-mono text-sm text-cyan-100">8,500</p>
            </div>
          </header>

          <div className="pointer-events-auto flex flex-col gap-4 self-start animate-in fade-in slide-in-from-bottom-3 duration-700 sm:flex-row sm:items-end">
            <div className="border border-white/15 bg-[#101522]/75 p-1.5 backdrop-blur-xl">
              <div className="flex" role="group" aria-label="Field preset">
                {presets.map((item) => (
                  <button
                    className={`px-3 py-2 text-xs transition-colors ${
                      preset === item.id
                        ? "bg-white text-[#0b0e16]"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => setPreset(item.id)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-56 border border-white/15 bg-[#101522]/75 px-4 py-3 backdrop-blur-xl">
              <div className="mb-2 flex justify-between text-[10px] font-medium tracking-[0.12em] text-slate-400">
                <label htmlFor="density">DENSITY</label>
                <output className="font-mono text-cyan-100">
                  {Math.round(density * 100)}%
                </output>
              </div>
              <input
                className="h-1 w-full cursor-pointer appearance-none bg-slate-600 accent-cyan-300"
                id="density"
                max="1"
                min="0.15"
                onChange={(event) => setDensity(Number(event.target.value))}
                step="0.01"
                type="range"
                value={density}
              />
            </div>

            <div className="flex border border-white/15 bg-[#101522]/75 p-1.5 backdrop-blur-xl">
              <button
                aria-label={paused ? "Resume motion" : "Pause motion"}
                className="grid size-9 place-items-center text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setPaused((isPaused) => !isPaused)}
                title={paused ? "Resume motion" : "Pause motion"}
                type="button"
              >
                {paused ? <Play size={15} /> : <Pause size={15} />}
              </button>
              <button
                aria-label="Regenerate field"
                className="grid size-9 place-items-center text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setSceneKey((key) => key + 1)}
                title="Regenerate field"
                type="button"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
