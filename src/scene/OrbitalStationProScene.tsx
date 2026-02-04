import { useFrame } from "@react-three/fiber";
import { RoundedBox, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

type Props = { mode: "dark" | "light" };

function makeStars(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.55;
    positions[i3 + 2] = -Math.random() * spread;
  }
  return positions;
}

function Beam({ x, z }: { x: number; z: number }) {
  return (
    <RoundedBox position={[x, 0.8, z]} args={[0.35, 2.7, 0.35]} radius={0.06} smoothness={6}>
      <meshStandardMaterial color={"#0b0f17"} roughness={0.7} metalness={0.55} />
    </RoundedBox>
  );
}

export default function OrbitalStationProScene({ mode }: Props) {
  const rig = useRef<THREE.Group>(null!);
  const stars = useMemo(() => makeStars(3600, 220), []);

  useFrame(({ camera, mouse }, dt) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.55, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.55 + mouse.y * 0.25, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7.6, 0.02);
    camera.lookAt(0, 0.35, -9.8);

    if (rig.current) {
      rig.current.position.z = Math.sin(Date.now() * 0.00022) * 0.10;
      rig.current.rotation.y += dt * 0.01;
    }
  });

  const bg = mode === "dark" ? "#000006" : "#eff6ff";

  return (
    <group>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 18, 150]} />

      {/* outside starfield */}
      <group position={[0, 1.2, -42]}>
        <Points positions={stars} stride={3} frustumCulled={false}>
          <PointMaterial transparent color={mode === "dark" ? "#ffffff" : "#111827"} size={0.013} sizeAttenuation depthWrite={false} opacity={0.7} />
        </Points>
      </group>

      <ambientLight intensity={mode === "dark" ? 0.26 : 0.7} />
      <directionalLight position={[6, 7, 3]} intensity={mode === "dark" ? 0.7 : 0.8} color={"#ffffff"} />
      <pointLight position={[0, 1.1, 2.2]} intensity={mode === "dark" ? 0.35 : 0.25} color={"#e5e7eb"} distance={30} />

      <group ref={rig} position={[0, 0.1, -12]}>
        {/* industrial tunnel */}
        <RoundedBox position={[0, 0.7, -6]} args={[7.0, 3.4, 18]} radius={0.24} smoothness={8}>
          <meshStandardMaterial color={mode === "dark" ? "#05070c" : "#e5e7eb"} roughness={0.85} metalness={0.12} />
        </RoundedBox>

        {/* deck */}
        <RoundedBox position={[0, -0.72, -6]} args={[6.7, 0.32, 17.6]} radius={0.16} smoothness={8}>
          <meshStandardMaterial color={mode === "dark" ? "#03040a" : "#f8fafc"} roughness={1} metalness={0.05} />
        </RoundedBox>

        {/* structural beams */}
        {[-3.0, 3.0].map((x) => (
          <group key={x}>
            <Beam x={x} z={-0.5} />
            <Beam x={x} z={-6.0} />
            <Beam x={x} z={-11.5} />
          </group>
        ))}

        {/* service panels (subtle light) */}
        {[-2.2, 2.2].map((x, i) => (
          <RoundedBox key={i} position={[x, 0.35, -8.6]} rotation={[0, x < 0 ? 0.22 : -0.22, 0]} args={[1.5, 0.32, 0.06]} radius={0.08} smoothness={6}>
            <meshStandardMaterial color={"#0b0f17"} roughness={0.55} metalness={0.35} emissive={"#e5e7eb"} emissiveIntensity={0.035} />
          </RoundedBox>
        ))}

        {/* viewport */}
        <RoundedBox position={[0, 1.0, -15.2]} args={[4.8, 1.8, 0.12]} radius={0.22} smoothness={8}>
          <meshStandardMaterial
            color={mode === "dark" ? "#070a10" : "#ffffff"}
            roughness={0.08}
            metalness={0.02}
            transparent
            opacity={mode === "dark" ? 0.14 : 0.12}
            emissive={mode === "dark" ? "#cbd5e1" : "#111827"}
            emissiveIntensity={mode === "dark" ? 0.28 : 0.08}
          />
        </RoundedBox>
      </group>
    </group>
  );
}
