import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
    selectedPart: string | null;
}

// Posiciones de cámara basadas en la estructura real del modelo GLB
// El modelo tiene escala ~37x, por lo que las coordenadas están ajustadas
const CAMERA_PRESETS: Record<string, { position: THREE.Vector3, target: THREE.Vector3 }> = {
    'cuerpo_01 - Default_0': { position: new THREE.Vector3(0, 5, 12), target: new THREE.Vector3(0, 2, 0) },
    'cuerpo_02 - Default_0': { position: new THREE.Vector3(5, 8, 10), target: new THREE.Vector3(0, 3, 0) },
    'cuerpo_03 - Default_0': { position: new THREE.Vector3(-5, 4, 10), target: new THREE.Vector3(0, 1, 0) },
    'hoja_transversal_15 - Default_0': { position: new THREE.Vector3(0, 12, 8), target: new THREE.Vector3(0, 5, 0) },
    'hoja_sagital_14 - Default_0': { position: new THREE.Vector3(12, 5, 0), target: new THREE.Vector3(0, 3, 0) },
    'hoja_coronal_13 - Default_0': { position: new THREE.Vector3(0, 5, -12), target: new THREE.Vector3(0, 3, 0) },
};

const DEFAULT_POSITION = new THREE.Vector3(0, 5, 15);
const DEFAULT_TARGET = new THREE.Vector3(0, 2, 0);

export const CameraRig: React.FC<CameraRigProps> = ({ selectedPart }) => {
    const { camera, controls } = useThree();

    const targetPosition = useRef(DEFAULT_POSITION.clone());
    const targetLookAt = useRef(DEFAULT_TARGET.clone());

    useEffect(() => {
        if (selectedPart && CAMERA_PRESETS[selectedPart]) {
            targetPosition.current.copy(CAMERA_PRESETS[selectedPart].position);
            targetLookAt.current.copy(CAMERA_PRESETS[selectedPart].target);
        } else {
            targetPosition.current.copy(DEFAULT_POSITION);
            targetLookAt.current.copy(DEFAULT_TARGET);
        }
    }, [selectedPart]);

    useFrame((_, delta) => {
        // Interpolación suave de la cámara
        camera.position.lerp(targetPosition.current, 2 * delta);

        if (controls) {
            const orbitControls = controls as any;
            if (orbitControls.target) {
                orbitControls.target.lerp(targetLookAt.current, 2 * delta);
                orbitControls.update();
            }
        }
    });

    return null;
};
