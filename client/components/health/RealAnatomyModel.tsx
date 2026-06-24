import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// -------------------------------------------------------
// Estructura real del modelo "planos_anatomicos.glb":
//
// Nodo raíz -> cuerpo (scale 37x)
//   ├── cuerpo_02 - Default_0  (Mesh: piel/exterior)
//   ├── cuerpo_01 - Default_0  (Mesh: capa interna 1)
//   └── cuerpo_03 - Default_0  (Mesh: capa interna 2)
//
// Planos de corte anatómico:
//   ├── Dummy_transversal -> hoja_transversal -> hoja_transversal_15 (Mesh)
//   ├── Dummy_sagital     -> hoja_sagital     -> hoja_sagital_14     (Mesh)
//   └── Dummy_coronal     -> hoja_coronal     -> hoja_coronal_13     (Mesh)
// -------------------------------------------------------

interface RealAnatomyModelProps {
    selectedPart: string | null;
    onPartSelected: (partName: string) => void;
    visibleLayers: {
        cuerpo_01: boolean;
        cuerpo_02: boolean;
        cuerpo_03: boolean;
        plano_transversal: boolean;
        plano_sagital: boolean;
        plano_coronal: boolean;
    };
    xrayMode: boolean;
}

// Mapeo de nombres internos del GLB a nombres legibles
const PART_LABELS: Record<string, string> = {
    'cuerpo_01 - Default_0': 'Capa Anatómica 1 (Principal)',
    'cuerpo_02 - Default_0': 'Capa Anatómica 2 (Exterior)',
    'cuerpo_03 - Default_0': 'Capa Anatómica 3 (Interior)',
    'hoja_transversal_15 - Default_0': 'Plano Transversal',
    'hoja_sagital_14 - Default_0': 'Plano Sagital',
    'hoja_coronal_13 - Default_0': 'Plano Coronal',
};

// Mapeo de nodo GLB -> key de visibilidad
const VISIBILITY_MAP: Record<string, keyof RealAnatomyModelProps['visibleLayers']> = {
    'cuerpo_01 - Default_0': 'cuerpo_01',
    'cuerpo_02 - Default_0': 'cuerpo_02',
    'cuerpo_03 - Default_0': 'cuerpo_03',
    'hoja_transversal_15 - Default_0': 'plano_transversal',
    'hoja_sagital_14 - Default_0': 'plano_sagital',
    'hoja_coronal_13 - Default_0': 'plano_coronal',
};

// Colores por capa
const LAYER_COLORS: Record<string, string> = {
    'cuerpo_01 - Default_0': '#f8a4a4',
    'cuerpo_02 - Default_0': '#fcd5b8',
    'cuerpo_03 - Default_0': '#ef4444',
    'hoja_transversal_15 - Default_0': '#38bdf8',
    'hoja_sagital_14 - Default_0': '#a78bfa',
    'hoja_coronal_13 - Default_0': '#34d399',
};

export const RealAnatomyModel: React.FC<RealAnatomyModelProps> = ({ selectedPart, onPartSelected, visibleLayers, xrayMode }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    // Carga real del modelo GLB
    const { scene } = useGLTF('/models/anatomy.glb');

    // Clonar escena para no mutar el caché global de useGLTF
    const clonedScene = useMemo(() => scene.clone(true), [scene]);

    // Aplicar materiales y visibilidad
    useEffect(() => {
        if (!clonedScene) return;

        clonedScene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const meshName = child.name;
            const visKey = VISIBILITY_MAP[meshName];

            // Visibilidad
            if (visKey) {
                child.visible = visibleLayers[visKey];
            }

            // Material
            const isSelected = meshName === selectedPart;
            const isHovered = meshName === hoveredNode;
            const baseColor = LAYER_COLORS[meshName] || '#e2e8f0';

            if (isSelected) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#0ea5e9',
                    metalness: 0.4,
                    roughness: 0.15,
                    emissive: '#0284c7',
                    emissiveIntensity: 0.6,
                    clearcoat: 1.0,
                    transparent: xrayMode,
                    opacity: xrayMode ? 0.7 : 1,
                    side: THREE.DoubleSide,
                });
            } else if (isHovered) {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: '#fbbf24',
                    metalness: 0.2,
                    roughness: 0.3,
                    emissive: '#f59e0b',
                    emissiveIntensity: 0.3,
                    clearcoat: 0.8,
                    transparent: xrayMode,
                    opacity: xrayMode ? 0.5 : 1,
                    side: THREE.DoubleSide,
                });
            } else {
                child.material = new THREE.MeshPhysicalMaterial({
                    color: baseColor,
                    metalness: 0.05,
                    roughness: 0.5,
                    clearcoat: 0.3,
                    clearcoatRoughness: 0.4,
                    transparent: xrayMode || meshName.includes('hoja'),
                    opacity: xrayMode ? 0.35 : (meshName.includes('hoja') ? 0.45 : 1),
                    side: THREE.DoubleSide,
                });
            }
        });
    }, [clonedScene, selectedPart, hoveredNode, visibleLayers, xrayMode]);

    return (
        <group
            ref={groupRef}
            onPointerOver={(e) => {
                e.stopPropagation();
                const name = e.object.name;
                if (name && PART_LABELS[name]) {
                    setHoveredNode(name);
                    document.body.style.cursor = 'pointer';
                }
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredNode(null);
                document.body.style.cursor = 'default';
            }}
            onClick={(e) => {
                e.stopPropagation();
                const name = e.object.name;
                if (name && PART_LABELS[name]) {
                    onPartSelected(name);
                }
            }}
        >
            <Center>
                <primitive object={clonedScene} />
            </Center>
        </group>
    );
};

export { PART_LABELS, VISIBILITY_MAP, LAYER_COLORS };

// Pre-cargar el modelo para evitar lag
useGLTF.preload('/models/anatomy.glb');
