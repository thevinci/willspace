import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Sparkles } from "@react-three/drei";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Crosshair,
  LocateFixed,
  Radio,
  Volume2,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import * as THREE from "three";

type Movement = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type BuildingData = {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  accent: string;
  seed: number;
};

const EMPTY_MOVEMENT: Movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const ACCENTS = ["#00f0ff", "#ff2a91", "#ffd23f", "#63ff7b"];

const BUILDINGS: BuildingData[] = [-36, -27, -18, -9, 9, 18, 27, 36].flatMap(
  (x, xIndex) =>
    [-54, -43, -32, -21, -10, 1, 12, 23].map((z, zIndex) => {
      const seed = (xIndex * 17 + zIndex * 11) % 13;
      const height = 10 + seed * 2.25;

      return {
        position: [x, height / 2, z] as [number, number, number],
        width: 6.2 + (seed % 3) * 0.7,
        height,
        depth: 7.4 + ((seed + 1) % 3) * 0.8,
        accent: ACCENTS[(xIndex + zIndex) % ACCENTS.length] ?? "#00f0ff",
        seed,
      };
    }),
);

function Building({
  position,
  width,
  height,
  depth,
  accent,
  seed,
}: BuildingData) {
  const bandCount = Math.max(2, Math.floor(height / 7));
  const upperHeight = height * (0.28 + (seed % 3) * 0.035);
  const lowerHeight = height - upperHeight;
  const upperScale = 0.68 + (seed % 4) * 0.055;

  return (
    <group position={position}>
      <mesh position={[0, -height / 2 + 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.08, 1.1, depth * 1.08]} />
        <meshStandardMaterial
          color="#111823"
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>

      <mesh
        position={[0, -height / 2 + lowerHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, lowerHeight, depth]} />
        <meshStandardMaterial
          color="#080d16"
          metalness={0.88}
          roughness={0.3}
        />
      </mesh>

      <mesh
        position={[0, height / 2 - upperHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[width * upperScale, upperHeight, depth * upperScale]}
        />
        <meshStandardMaterial
          color="#0d141e"
          metalness={0.9}
          roughness={0.27}
        />
      </mesh>

      <mesh position={[0, -upperHeight / 2, depth / 2 + 0.018]}>
        <planeGeometry args={[0.065, lowerHeight * 0.82]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.56}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[
          width * upperScale * 0.24,
          height / 2 - upperHeight / 2,
          (depth * upperScale) / 2 + 0.018,
        ]}
      >
        <planeGeometry args={[0.055, upperHeight * 0.72]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.48}
          toneMapped={false}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (width / 2 + 0.06), -upperHeight / 2, 0]}>
            <boxGeometry args={[0.12, lowerHeight * 0.82, depth * 0.14]} />
            <meshStandardMaterial
              color="#2a3541"
              metalness={0.95}
              roughness={0.22}
            />
          </mesh>
          <mesh
            position={[
              side * (width * 0.24),
              -height / 2 + 1.25,
              depth / 2 + 0.16,
            ]}
          >
            <boxGeometry args={[width * 0.24, 1.4, 0.32]} />
            <meshStandardMaterial
              color="#222c36"
              metalness={0.92}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {Array.from({ length: bandCount }, (_, index) => {
        const y = -height / 2 + 3.2 + index * 6.4;
        return (
          <group key={index} position={[0, y, 0]}>
            <mesh position={[0, 0, depth / 2 + 0.015]}>
              <planeGeometry args={[width * 0.78, 0.13]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
            <mesh
              position={[width / 2 + 0.015, 0, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[depth * 0.78, 0.09]} />
              <meshBasicMaterial color={accent} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry
          args={[width * upperScale * 0.78, 0.4, depth * upperScale * 0.78]}
        />
        <meshStandardMaterial color="#111925" metalness={0.9} roughness={0.2} />
      </mesh>

      <group position={[0, height / 2 + 0.62, 0]}>
        <mesh>
          <cylinderGeometry args={[0.48, 0.62, 0.75, 10]} />
          <meshStandardMaterial
            color="#242e38"
            metalness={0.94}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[width * upperScale * 0.22, -0.1, 0]}>
          <boxGeometry args={[0.72, 0.48, 0.84]} />
          <meshStandardMaterial
            color="#1a252f"
            metalness={0.92}
            roughness={0.3}
          />
        </mesh>
      </group>

      {seed % 3 === 0 && (
        <group position={[0, height / 2 + 2.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.06, 3.4, 8]} />
            <meshStandardMaterial
              color="#64717c"
              metalness={1}
              roughness={0.18}
            />
          </mesh>
          <mesh position={[0, 1.72, 0]}>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function StreetGrid() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 105]} />
        <meshStandardMaterial
          color="#04070b"
          metalness={0.55}
          roughness={0.52}
        />
      </mesh>

      {[-4.7, 4.7].map((x) => (
        <mesh
          key={x}
          position={[x, 0.025, -16]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.1, 94]} />
          <meshBasicMaterial color="#d5a92f" />
        </mesh>
      ))}

      {Array.from({ length: 24 }, (_, index) => (
        <mesh
          key={index}
          position={[0, 0.035, 29 - index * 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.12, 1.7]} />
          <meshBasicMaterial color="#b9e5df" />
        </mesh>
      ))}

      {[-13.5, 13.5, -22.5, 22.5, -31.5, 31.5, -40.5, 40.5].map((x) => (
        <mesh key={x} position={[x, 0.09, -16]} receiveShadow>
          <boxGeometry args={[1, 0.18, 94]} />
          <meshStandardMaterial color="#151b20" roughness={0.6} />
        </mesh>
      ))}

      {[-37.5, -15.5, 6.5].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.06, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[94, 5]} />
            <meshStandardMaterial
              color="#070a0e"
              metalness={0.7}
              roughness={0.38}
            />
          </mesh>
          {Array.from({ length: 18 }, (_, index) => (
            <mesh
              key={index}
              position={[-42.5 + index * 5, 0.09, z]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
              <planeGeometry args={[0.1, 2.1]} />
              <meshBasicMaterial color="#4f6867" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function StreetDetails() {
  const lampPositions = [18, 5, -9, -22, -35, -48];

  return (
    <group>
      {[-1, 1].flatMap((side) =>
        lampPositions.map((z, index) => {
          const x = side * 6.7;
          const lampX = x - side * 0.82;
          const color = index % 3 === 0 ? "#ff2a91" : "#00f0ff";
          return (
            <group key={`${side}-${z}`}>
              <mesh position={[x, 0.34, z]} castShadow>
                <cylinderGeometry args={[0.24, 0.34, 0.68, 8]} />
                <meshStandardMaterial
                  color="#202a33"
                  metalness={0.94}
                  roughness={0.28}
                />
              </mesh>
              <mesh position={[x, 2.65, z]} castShadow>
                <cylinderGeometry args={[0.075, 0.11, 4.65, 8]} />
                <meshStandardMaterial
                  color="#313e48"
                  metalness={0.95}
                  roughness={0.24}
                />
              </mesh>
              <mesh position={[(x + lampX) / 2, 4.9, z]}>
                <boxGeometry args={[0.95, 0.1, 0.12]} />
                <meshStandardMaterial
                  color="#35434c"
                  metalness={0.96}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[lampX, 4.82, z]}>
                <cylinderGeometry args={[0.17, 0.24, 0.22, 10]} />
                <meshBasicMaterial color={color} toneMapped={false} />
              </mesh>
              {index % 2 === 0 && (
                <pointLight
                  position={[lampX, 4.55, z]}
                  color={color}
                  intensity={5}
                  distance={7}
                />
              )}
            </group>
          );
        }),
      )}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 7.1, 0, side > 0 ? 10 : -3]}>
          <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.1, 2.5, 2.7]} />
            <meshStandardMaterial
              color="#101821"
              metalness={0.82}
              roughness={0.34}
            />
          </mesh>
          <mesh
            position={[-side * 1.08, 1.45, 0]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <planeGeometry args={[1.7, 1.25]} />
            <meshBasicMaterial
              color={side > 0 ? "#ff2a91" : "#00f0ff"}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 2.78, 0]}>
            <boxGeometry args={[2.65, 0.14, 3.15]} />
            <meshStandardMaterial
              color="#29333b"
              metalness={0.9}
              roughness={0.28}
            />
          </mesh>
          <mesh position={[0, 2.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.25, 2.7]} />
            <meshBasicMaterial
              color={side > 0 ? "#ff2a91" : "#00f0ff"}
              transparent
              opacity={0.28}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function NeonSign({
  position,
  rotation = [0, 0, 0],
  color,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  children: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[4.8, 1.6, 0.16]} />
        <meshStandardMaterial
          color="#05070a"
          metalness={0.8}
          roughness={0.26}
        />
      </mesh>
      <pointLight color={color} intensity={7} distance={7} />
      <Html transform position={[0, 0, 0.1]} distanceFactor={5.2} center>
        <div className="city-neon-sign" style={{ color, borderColor: color }}>
          {children}
        </div>
      </Html>
    </group>
  );
}

function HoverCar({
  lane,
  offset,
  color,
}: {
  lane: number;
  offset: number;
  color: string;
}) {
  const car = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!car.current) return;
    const cycle = (clock.elapsedTime * (7 + lane * 0.25) + offset) % 105;
    car.current.position.z = 34 - cycle;
    car.current.position.y =
      0.7 + Math.sin(clock.elapsedTime * 2 + offset) * 0.08;
  });

  return (
    <group ref={car} position={[lane, 0.7, 0]}>
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[1.62, 0.34, 2.85]} />
        <meshStandardMaterial color="#111821" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.32, 0.05]} castShadow>
        <boxGeometry args={[1.18, 0.48, 1.55]} />
        <meshPhysicalMaterial
          color="#18344a"
          emissive={color}
          emissiveIntensity={0.08}
          metalness={0.42}
          roughness={0.12}
          transparent
          opacity={0.82}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.83, -0.08, 0.28]}>
          <mesh>
            <boxGeometry args={[0.2, 0.26, 2.08]} />
            <meshStandardMaterial
              color="#29323b"
              metalness={0.94}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.22, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.03, -1.45]}>
        <boxGeometry args={[1.25, 0.1, 0.08]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.04, 1.5]}>
        <boxGeometry args={[1.28, 0.09, 0.07]} />
        <meshBasicMaterial color="#ff334f" toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.98, 0.1, 1.05]}
          rotation={[0, 0, side * 0.24]}
        >
          <boxGeometry args={[0.45, 0.08, 0.85]} />
          <meshStandardMaterial
            color="#222c35"
            metalness={0.96}
            roughness={0.18}
          />
        </mesh>
      ))}
      <pointLight
        position={[0, -0.28, 0.1]}
        color={color}
        intensity={6}
        distance={4.5}
      />
    </group>
  );
}

function SkyTrain() {
  const train = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!train.current) return;
    train.current.position.x = ((clock.elapsedTime * 5 + 45) % 100) - 50;
  });

  return (
    <group position={[0, 10.5, -28]}>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[100, 0.34, 0.72]} />
        <meshStandardMaterial
          color="#202933"
          metalness={0.92}
          roughness={0.25}
        />
      </mesh>
      {[-26, -9, 9, 26].map((x) => (
        <group key={x} position={[x, -5.6, 0]}>
          <mesh>
            <boxGeometry args={[0.65, 9.1, 0.65]} />
            <meshStandardMaterial
              color="#1e2831"
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 4.15, 0]}>
            <boxGeometry args={[2.8, 0.32, 0.82]} />
            <meshStandardMaterial
              color="#27343e"
              metalness={0.92}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
      <group ref={train}>
        {[-5.6, 0, 5.6].map((carX, carIndex) => (
          <group key={carX} position={[carX, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[5.2, 1.35, 1.72]} />
              <meshStandardMaterial
                color="#18212b"
                metalness={0.92}
                roughness={0.18}
              />
            </mesh>
            {[-1.65, -0.55, 0.55, 1.65].map((windowX) => (
              <mesh key={windowX} position={[windowX, 0.14, 0.87]}>
                <planeGeometry args={[0.72, 0.48]} />
                <meshBasicMaterial
                  color={carIndex === 1 ? "#ffca42" : "#00d9ff"}
                  toneMapped={false}
                />
              </mesh>
            ))}
            <mesh position={[0, -0.5, 0.88]}>
              <planeGeometry args={[4.7, 0.08]} />
              <meshBasicMaterial color="#ff2a91" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {[-8.65, 8.65].map((x, index) => (
          <mesh
            key={x}
            position={[x, 0, 0]}
            rotation={[0, 0, index === 0 ? Math.PI / 2 : -Math.PI / 2]}
          >
            <coneGeometry args={[0.86, 0.9, 8]} />
            <meshStandardMaterial
              color="#202b35"
              metalness={0.94}
              roughness={0.16}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Drone({ offset }: { offset: number }) {
  const drone = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!drone.current) return;
    const time = clock.elapsedTime * 0.35 + offset;
    drone.current.position.set(
      Math.cos(time) * (14 + offset),
      11 + Math.sin(time * 2.1) * 2,
      -18 + Math.sin(time) * 18,
    );
    drone.current.rotation.y = -time;
  });

  return (
    <group ref={drone}>
      <mesh castShadow>
        <sphereGeometry args={[0.38, 12, 8]} />
        <meshStandardMaterial color="#181d24" metalness={1} roughness={0.1} />
      </mesh>
      {[0, Math.PI / 2].map((rotation) => (
        <group key={rotation} rotation={[0, rotation, 0]}>
          <mesh>
            <boxGeometry args={[2.1, 0.09, 0.12]} />
            <meshStandardMaterial
              color="#35404a"
              metalness={0.95}
              roughness={0.18}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[side, 0.02, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.3, 0.035, 8, 20]} />
                <meshBasicMaterial
                  color="#73f7ff"
                  transparent
                  opacity={0.72}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.13, 8]} />
                <meshStandardMaterial
                  color="#4b5962"
                  metalness={1}
                  roughness={0.16}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, -0.34, -0.2]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshBasicMaterial color="#ff2a91" toneMapped={false} />
      </mesh>
      <pointLight color="#ff2a91" intensity={7} distance={5} />
      <mesh position={[0, -0.46, 0]}>
        <cylinderGeometry args={[0.015, 0.08, 7, 8]} />
        <meshBasicMaterial
          color="#ff2a91"
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Hologram() {
  const hologram = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!hologram.current) return;
    hologram.current.rotation.y = clock.elapsedTime * 0.7;
    hologram.current.position.y =
      5.2 + Math.sin(clock.elapsedTime * 1.6) * 0.25;
  });

  return (
    <group position={[7, 0, -13]}>
      <group ref={hologram} position={[0, 5.2, 0]}>
        <mesh>
          <torusKnotGeometry args={[1.1, 0.16, 96, 12]} />
          <meshBasicMaterial
            color="#00f0ff"
            wireframe
            transparent
            opacity={0.72}
            toneMapped={false}
          />
        </mesh>
        <pointLight color="#00f0ff" intensity={10} distance={10} />
      </group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.92, 1.18, 0.56, 12]} />
        <meshStandardMaterial
          color="#1d2932"
          metalness={0.95}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.74, 0.08, 8, 32]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[2.25, 4.2, 24, 1, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.045}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Rain() {
  const rain = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(900 * 3);
    for (let index = 0; index < 900; index += 1) {
      values[index * 3] = ((index * 47) % 100) - 50;
      values[index * 3 + 1] = ((index * 83) % 35) + 1;
      values[index * 3 + 2] = ((index * 61) % 105) - 68;
    }
    return values;
  }, []);

  useFrame((_, delta) => {
    if (!rain.current) return;
    rain.current.position.y -= delta * 15;
    if (rain.current.position.y < -35) rain.current.position.y = 0;
  });

  return (
    <points ref={rain}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9eeeff" size={0.045} transparent opacity={0.72} />
    </points>
  );
}

function PlayerRig({
  movement,
  onLockChange,
}: {
  movement: MutableRefObject<Movement>;
  onLockChange: (locked: boolean) => void;
}) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(-0.04);
  const walkingTime = useRef(0);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const velocity = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    let activeTouchPointer: number | null = null;
    let previousTouchX = 0;
    let previousTouchY = 0;
    const handlePointerLock = () =>
      onLockChange(document.pointerLockElement === canvas);
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      yaw.current -= event.movementX * 0.0022;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - event.movementY * 0.0018,
        -Math.PI / 2.4,
        Math.PI / 2.4,
      );
    };
    const handleTouchStart = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || activeTouchPointer !== null) return;
      activeTouchPointer = event.pointerId;
      previousTouchX = event.clientX;
      previousTouchY = event.clientY;
    };
    const handleTouchMove = (event: PointerEvent) => {
      if (event.pointerId !== activeTouchPointer) return;
      yaw.current -= (event.clientX - previousTouchX) * 0.005;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - (event.clientY - previousTouchY) * 0.004,
        -Math.PI / 2.4,
        Math.PI / 2.4,
      );
      previousTouchX = event.clientX;
      previousTouchY = event.clientY;
    };
    const handleTouchEnd = (event: PointerEvent) => {
      if (event.pointerId === activeTouchPointer) activeTouchPointer = null;
    };

    document.addEventListener("pointerlockchange", handlePointerLock);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("pointerdown", handleTouchStart);
    canvas.addEventListener("pointermove", handleTouchMove);
    canvas.addEventListener("pointerup", handleTouchEnd);
    canvas.addEventListener("pointercancel", handleTouchEnd);
    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLock);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("pointerdown", handleTouchStart);
      canvas.removeEventListener("pointermove", handleTouchMove);
      canvas.removeEventListener("pointerup", handleTouchEnd);
      canvas.removeEventListener("pointercancel", handleTouchEnd);
    };
  }, [gl, onLockChange]);

  useFrame(({ clock }, delta) => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
    forward.set(0, 0, -1).applyAxisAngle(up, yaw.current);
    right.set(1, 0, 0).applyAxisAngle(up, yaw.current);
    velocity.set(0, 0, 0);

    if (movement.current.forward) velocity.add(forward);
    if (movement.current.backward) velocity.sub(forward);
    if (movement.current.right) velocity.add(right);
    if (movement.current.left) velocity.sub(right);

    if (velocity.lengthSq() > 0) {
      velocity.normalize().multiplyScalar(delta * 7.2);
      camera.position.add(velocity);
      walkingTime.current += delta * 10;
    }

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.5, 6.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -62, 30);
    camera.position.y =
      1.75 +
      Math.sin(walkingTime.current) * (velocity.lengthSq() > 0 ? 0.035 : 0);

    if (clock.elapsedTime < 1.4) {
      camera.rotation.x = pitch.current;
    }
  });

  return null;
}

function CityScene({
  movement,
  onLockChange,
}: {
  movement: MutableRefObject<Movement>;
  onLockChange: (locked: boolean) => void;
}) {
  return (
    <>
      <color attach="background" args={["#020408"]} />
      <fog attach="fog" args={["#040711", 18, 105]} />
      <ambientLight intensity={0.24} color="#7294aa" />
      <hemisphereLight args={["#27435f", "#050406", 0.75]} />
      <directionalLight
        castShadow
        position={[8, 24, 14]}
        color="#7eb7cf"
        intensity={1.3}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-7, 4, 10]}
        color="#ff2a91"
        intensity={15}
        distance={17}
      />
      <pointLight
        position={[7, 5, -6]}
        color="#00f0ff"
        intensity={13}
        distance={19}
      />

      <StreetGrid />
      <StreetDetails />
      {BUILDINGS.map((building, index) => (
        <Building key={index} {...building} />
      ))}

      <NeonSign
        position={[-5.8, 6.6, -6]}
        rotation={[0, Math.PI / 2, 0]}
        color="#ff2a91"
      >
        NOIR//24
      </NeonSign>
      <NeonSign
        position={[5.8, 8.5, -23]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#ffd23f"
      >
        SYNTHETIC
      </NeonSign>
      <NeonSign
        position={[-5.8, 5.3, -39]}
        rotation={[0, Math.PI / 2, 0]}
        color="#63ff7b"
      >
        NIGHT MART
      </NeonSign>

      <HoverCar lane={-2.2} offset={0} color="#ff2a91" />
      <HoverCar lane={2.3} offset={31} color="#00f0ff" />
      <HoverCar lane={-2.4} offset={67} color="#ffd23f" />
      <SkyTrain />
      <Drone offset={0.5} />
      <Drone offset={4.2} />
      <Hologram />
      <Rain />
      <Sparkles
        count={110}
        scale={[80, 24, 100]}
        size={1.1}
        speed={0.18}
        color="#4adcec"
        opacity={0.4}
      />
      <Environment preset="night" environmentIntensity={0.18} />
      <PlayerRig movement={movement} onLockChange={onLockChange} />
    </>
  );
}

const KEY_TO_MOVEMENT: Record<string, keyof Movement> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
};

export function CyberCity() {
  const shellRef = useRef<HTMLElement>(null);
  const movement = useRef<Movement>({ ...EMPTY_MOVEMENT });
  const [isLocked, setIsLocked] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    document.body.classList.add("city-active");
    return () => document.body.classList.remove("city-active");
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, pressed: boolean) => {
      const direction = KEY_TO_MOVEMENT[event.code];
      if (!direction) return;
      movement.current[direction] = pressed;
    };
    const handleKeyDown = (event: KeyboardEvent) => handleKey(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleKey(event, false);
    const stopMoving = () => Object.assign(movement.current, EMPTY_MOVEMENT);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", stopMoving);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", stopMoving);
    };
  }, []);

  const enterCity = () => {
    setHasEntered(true);
    const canvas = shellRef.current?.querySelector("canvas");
    if (canvas && window.matchMedia("(pointer: fine)").matches) {
      canvas.requestPointerLock();
    }
  };

  const setTouchMovement =
    (direction: keyof Movement, pressed: boolean) =>
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      movement.current[direction] = pressed;
    };

  return (
    <main
      ref={shellRef}
      className="city-shell"
      aria-label="Neon District interactive city"
    >
      <Canvas
        shadows
        dpr={[1, 1.55]}
        camera={{ position: [0, 1.75, 23], fov: 67, near: 0.1, far: 180 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <CityScene movement={movement} onLockChange={setIsLocked} />
        </Suspense>
      </Canvas>

      <div className="city-vignette" aria-hidden="true" />
      <div className="city-scanlines" aria-hidden="true" />

      <section
        className={`city-intro ${hasEntered ? "city-intro--entered" : ""}`}
      >
        <p className="city-kicker">WILLSPACE // SECTOR 07</p>
        <h1>
          NEON
          <br />
          DISTRICT
        </h1>
        <p className="city-status">
          <span /> NIGHT CYCLE ACTIVE
        </p>
        <button type="button" className="city-enter" onClick={enterCity}>
          <Crosshair aria-hidden="true" />
          Enter district
        </button>
      </section>

      <aside className="city-location" aria-label="Current location">
        <LocateFixed aria-hidden="true" />
        <div>
          <strong>SHIN-KIBA CROSSING</strong>
          <span>35.6458 N / 139.8267 E</span>
        </div>
      </aside>

      <div className="city-telemetry" aria-label="District telemetry">
        <span>
          <Radio aria-hidden="true" /> LIVE
        </span>
        <span>AQI 72</span>
        <span>18 C</span>
        <button
          type="button"
          aria-label="Ambient audio unavailable"
          title="Ambient audio unavailable"
        >
          <Volume2 aria-hidden="true" />
        </button>
      </div>

      <div
        className={`city-reticle ${isLocked ? "city-reticle--visible" : ""}`}
        aria-hidden="true"
      />

      <div className="city-touch-controls" aria-label="Movement controls">
        <button
          type="button"
          aria-label="Move forward"
          onPointerDown={setTouchMovement("forward", true)}
          onPointerUp={setTouchMovement("forward", false)}
          onPointerCancel={setTouchMovement("forward", false)}
        >
          <ArrowUp />
        </button>
        <button
          type="button"
          aria-label="Move left"
          onPointerDown={setTouchMovement("left", true)}
          onPointerUp={setTouchMovement("left", false)}
          onPointerCancel={setTouchMovement("left", false)}
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          aria-label="Move backward"
          onPointerDown={setTouchMovement("backward", true)}
          onPointerUp={setTouchMovement("backward", false)}
          onPointerCancel={setTouchMovement("backward", false)}
        >
          <ArrowDown />
        </button>
        <button
          type="button"
          aria-label="Move right"
          onPointerDown={setTouchMovement("right", true)}
          onPointerUp={setTouchMovement("right", false)}
          onPointerCancel={setTouchMovement("right", false)}
        >
          <ArrowRight />
        </button>
      </div>
    </main>
  );
}
