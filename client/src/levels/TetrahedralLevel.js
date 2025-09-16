// TetrahedralLevel.js
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EdgesGeometry, LineSegments, LineBasicMaterial } from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import "./TetrahedralLevel.css";

export default function TetrahedralLevel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 9);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 5, 6);
    scene.add(dir);

    // Tetrahedron (triangular pyramid)
    const FACE_COLOR = 0x21543a;
    const EDGE_COLOR = 0x2e8b57;

    const tetraGeom = new THREE.TetrahedronGeometry(3);
    const tetraMat = new THREE.MeshBasicMaterial({
      color: FACE_COLOR,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const tetra = new THREE.Mesh(tetraGeom, tetraMat);
    scene.add(tetra);

    const edges = new LineSegments(
      new EdgesGeometry(tetraGeom),
      new LineBasicMaterial({ color: EDGE_COLOR, linewidth: 2 })
    );
    scene.add(edges);

    // ---- Put "hello" on each face, correctly oriented ----
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      const textMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1, // pull text slightly toward camera in depth
        polygonOffsetUnits: -1,
      });

      const pos = tetraGeom.getAttribute("position");
      const index = tetraGeom.index; // may be null; tetra has non-indexed by default
      const triCount = (index ? index.count : pos.count) / 3;

      const getVertex = (i) =>
        new THREE.Vector3().fromBufferAttribute(pos, i);

      const zAxis = new THREE.Vector3(0, 0, 1);
      const tmp1 = new THREE.Vector3();
      const tmp2 = new THREE.Vector3();
      const center = new THREE.Vector3();
      const normal = new THREE.Vector3();

      for (let f = 0; f < triCount; f++) {
        // Get triangle vertex indices
        const i0 = index ? index.getX(f * 3 + 0) : f * 3 + 0;
        const i1 = index ? index.getX(f * 3 + 1) : f * 3 + 1;
        const i2 = index ? index.getX(f * 3 + 2) : f * 3 + 2;

        const v0 = getVertex(i0);
        const v1 = getVertex(i1);
        const v2 = getVertex(i2);

        // Centroid
        center.copy(v0).add(v1).add(v2).divideScalar(3);

        // Face normal (outward)
        normal.copy(v1).sub(v0);
        tmp1.copy(v2).sub(v0);
        normal.cross(tmp1).normalize();

        // Text geometry (center it so rotation is about its middle)
        const tGeom = new TextGeometry("hello", {
          font,
          size: 0.55,
          height: 0.05,
          curveSegments: 4,
        });
        tGeom.computeBoundingBox();
        tGeom.center();

        const text = new THREE.Mesh(tGeom, textMat);

        // Align local +Z (text default facing) to the face normal
        const q = new THREE.Quaternion().setFromUnitVectors(zAxis, normal);
        text.quaternion.copy(q);

        // Optional: orient baseline along a stable tangent on the face
        // Build a tangent that's not parallel to normal
        const up = Math.abs(normal.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
        // Project up onto the face to get tangent
        const tangent = tmp2.copy(up).sub(normal.clone().multiplyScalar(up.dot(normal))).normalize();
        // Rotate around normal so text X axis aligns with tangent
        // (text X axis is local +X after the first rotation)
        const xAxisWorld = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
        const angle = Math.atan2(
          xAxisWorld.clone().cross(tangent).dot(normal),
          xAxisWorld.dot(tangent)
        );
        text.rotateOnAxis(normal, angle);

        // Position slightly above the face to prevent z-fighting
        const OFFSET = 0.02;
        text.position.copy(center).add(normal.clone().multiplyScalar(OFFSET));

        scene.add(text);
      }
    });

    // Animation
    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      const t = clock.getElapsedTime();
      tetra.rotation.x = t * 0.4;
      tetra.rotation.y = t * 0.6;
      edges.rotation.copy(tetra.rotation);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      tetraGeom.dispose();
      tetraMat.dispose();
      edges.material.dispose();
    };
  }, []);

  return <div ref={mountRef} className="tetrahedral-level" />;
}
