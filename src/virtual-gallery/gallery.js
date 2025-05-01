import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import nipplejs from 'nipplejs';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';


const artworksByRoom = {
  color: ['color1.jpeg', 'color2.jpeg', 'color3.png', 'color4.jpeg', 'color5.jpeg'],
  bw: ['bw1_A.jpeg', 'bw1_B.jpeg', 'bw2.png'],
  death: ['death1.jpeg', 'death2.png', 'death3.jpeg', 'death4.jpeg', 'death5.jpeg', 'death6.jpeg', 'death7.jpeg'],
  sculpture: [
    'sculpture1_A.png', 'sculpture1_B.png', 'sculpture1_C.png',
    'sculpture2_A.jpeg', 'sculpture2_B.jpeg',
    'sculpture3_A.jpeg', 'sculpture3_B.jpeg',
    'sculpture4_A.jpeg', 'sculpture4_B.jpeg',
    'sculpture5_A.png', 'sculpture5_B.png',
    'sculpture6_A.jpeg', 'sculpture6_B.jpeg',
    'sculpture7_A.jpeg', 'sculpture7_B.jpeg'
  ]
};

const wallArtworkByRoom = {
  // entrance: ['exhibit1.png', 'exhibit2.png'],
  color: ['color1.jpeg', 'color2.jpeg', 'color3.png', 'color4.jpeg', 'color5.jpeg'],
  bw: ['bw1_A.jpeg', 'bw1_B.jpeg', 'bw2.png'],
  death: ['death1.jpeg', 'death2.png', 'death3.jpeg', 'death4.jpeg', 'death5.jpeg', 'death6.jpeg', 'death7.jpeg'],
  sculpture: [
    'sculpture1_B.png','sculpture2_B.jpeg',
    'sculpture3_A.jpeg','sculpture4_A.jpeg', 'sculpture5_A.png', 
    'sculpture6_A.jpeg', 'sculpture7_B.jpeg'
  ]
};

// const roomPositions = {
//   all: new THREE.Vector3(0, 5, 70),
//   color: new THREE.Vector3(0, 5, 70),
//   bw: new THREE.Vector3(40, 5, 70),
//   sculpture: new THREE.Vector3(80, 5, 70),
//   death: new THREE.Vector3(120, 5, 70)
// };

const GalleryScene = () => {
  const mountRef = useRef(null);
  const joystickRef = useRef(null);
  const [infoBox, setInfoBox] = useState(null);
  const [zoomedObject, setZoomedObject] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);



  const camera = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const currentCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.current = currentCamera;
    //camera.current.position.set(0, 4, 20);
    camera.current.position.set(60, 5, 100); 
    camera.current.lookAt(new THREE.Vector3(60, 5, 0)); 


    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    const skylight = new THREE.DirectionalLight(0xffffff, 0.9);
    skylight.position.set(0, 50, 50);
    scene.add(ambientLight, skylight);

    const loader = new THREE.TextureLoader();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: '#E6E1D3' });
    const frameMaterial = new THREE.MeshBasicMaterial({ color: '#222' });
    const woodTexture = loader.load(process.env.PUBLIC_URL + '/assets/icons/wood-floor.png');
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(12, 12);
    
    const artworkWidth = 4;
    const artworkSpacing = 2;
    const roomPadding = 0;
    const minRoomWidth = 40;

    const themes = [
      { name: 'Color', path: 'color', color: '#d0e4f0', position: [0, 0, 0] },
      { name: 'Black & White', path: 'bw', color: '#f6f6f6', position: [0, 0, 0] },
      { name: 'Sculpture', path: 'sculpture', color: '#e8dff4', position: [0, 0, 0] },
      { name: 'Death', path: 'death', color: '#f2dede', position: [0, 0, 0] }
    ];

    let runningX = 0; // Starting position for the first room
    themes.forEach(theme => {
      const artworksInRoom = wallArtworkByRoom[theme.path] || [];
      const numArtworks = artworksInRoom.length;
      const calculatedWidth = (artworkWidth + artworkSpacing) * numArtworks + roomPadding;
      const roomWidth = Math.max(calculatedWidth, minRoomWidth);

      theme.roomWidth = roomWidth;
      theme.position = [runningX, 0, 0];

      runningX += roomWidth;
    });
         
        scene.children
        .filter(obj => obj.name === 'dividerWall')
        .forEach(obj => scene.remove(obj));

        if (selectedRoom === 'all') {
          // First wall (before the first room)
          const firstTheme = themes[0];
          const firstWall = new THREE.Mesh(
            new THREE.PlaneGeometry(70, 10),
            wallMaterial
          );
          firstWall.rotation.y = Math.PI / 2;
          firstWall.position.set(firstTheme.position[0] - firstTheme.roomWidth / 2, 5, -15);
          scene.add(firstWall);

          // Last wall (after the last room)
          const lastTheme = themes[themes.length - 1];
          const lastWall = new THREE.Mesh(
            new THREE.PlaneGeometry(70, 10),
            wallMaterial
          );
          lastWall.rotation.y = -Math.PI / 2;
          lastWall.position.set(lastTheme.position[0] + lastTheme.roomWidth / 2, 5, -15);
          scene.add(lastWall);
          // for (let i = 0; i < themes.length - 1; i++) {
          //   const x1 = themes[i].position[0];
          //   const x2 = themes[i + 1].position[0];
          //   const midpointX = (x1 + x2) / 2;
          //   const z = themes[i].position[2];

          //   const dividerWall = new THREE.Mesh(
          //     new THREE.PlaneGeometry(1, 10),
          //     wallMaterial
          //   );
          //   dividerWall.name = 'dividerWall'; 
          //   dividerWall.position.set(midpointX, 5, z - 15.01);
          //   scene.add(dividerWall);
          // }

          for (let i = 0; i < themes.length - 1; i++) {
            const theme = themes[i];
            console.log(themes.length);
            console.log('looping through index: ', i);
            console.log('theme', theme);
            const nextTheme = themes[i + 1];
            console.log('nextTheme', nextTheme);
            
            const dividerX = (theme.position[0] + theme.roomWidth / 2 + nextTheme.position[0] - nextTheme.roomWidth / 2) / 2;
            console.log('dividerX', dividerX);
            // const z = theme.position[2];
            const z = 0; // Adjust this value as needed for the z position

            // roomPositions[theme.path] = new THREE.Vector3(dividerX, 0, 0); // Update the room position for the current theme
          
            // const dividerWall = new THREE.Mesh(
            //   new THREE.PlaneGeometry(50, 10),
            //   wallMaterial
            // );

            const rightWall = new THREE.Mesh(
              new THREE.PlaneGeometry(70, 10), 
              wallMaterial);
            rightWall.rotation.y = -Math.PI / 2;
            rightWall.position.set(dividerX - 0.5, 5, z - 15);
            console.log('rightWall', rightWall);
            scene.add(rightWall);
    
            const leftWall = new THREE.Mesh(
              new THREE.PlaneGeometry(70, 10), 
              wallMaterial);
            leftWall.rotation.y = Math.PI / 2;
            leftWall.position.set(dividerX + 0.5, 5, z - 15); 
            scene.add(leftWall);

            // console.log('dividerWall', dividerWall);
            // dividerWall.name = 'dividerWall';
            // dividerWall.rotation.y = Math.PI / 2;
            // dividerWall.position.set(dividerX, 5, z - 15.01);
            // scene.add(dividerWall);
            const spotlight = new THREE.SpotLight(new THREE.Color(0xffffff), 5, 10, Math.PI / 4, 0.3);
            
            switch (i) {
              default: {
                console.log('default case', theme.position[0], z - 5);
                break;
              }
              case 0: {
                console.log('case 0', theme.position[0], z - 5);
                spotlight.position.set(dividerX / 2, 5, z - 5);
                // spotlight.position.set(x, 13, z - 15);
                // spotlight.castShadow = true;
                // spotlight.angle = Math.PI / 4;
                spotlight.add(new THREE.SpotLightHelper(spotlight)) 
                scene.add(spotlight);
                // spotlight.target.position.set(x, 5, z - 5);
                // scene.add(spotlight.target);
                break;
              }
              case 1: {
                console.log('case 1', dividerX / 2, z - 5);
                spotlight.position.set(dividerX / 2, 5, z - 5);
                // spotlight.position.set(x, 13, z - 15);
                // spotlight.castShadow = true;
                // spotlight.angle = Math.PI / 4;
                spotlight.add(new THREE.SpotLightHelper(spotlight)) 
                scene.add(spotlight);
                // spotlight.target.position.set(x, 5, z - 5);
                // scene.add(spotlight.target);
                break;
              }
              case 2: {
                console.log('case 2', dividerX / 2, z - 5);
                spotlight.position.set(dividerX / 2, 5, z - 5);
                // spotlight.position.set(x, 13, z - 15);
                // spotlight.castShadow = true;
                // spotlight.angle = Math.PI / 4;
                spotlight.add(new THREE.SpotLightHelper(spotlight)) 
                scene.add(spotlight);
                // spotlight.target.position.set(x, 5, z - 5);
                // scene.add(spotlight.target);
                const spotlight2 = new THREE.SpotLight(new THREE.Color(0xffffff), 5, 10, Math.PI / 4, 0.3);
                spotlight2.position.set(72, 5, z - 5);
                spotlight2.add(new THREE.SpotLightHelper(spotlight2)) 
                scene.add(spotlight2);
                break;
              }
            }
          }
        }

    themes.forEach(({ name, path, color, position, roomWidth }) => {
      console.log(themes);
      // console.log(path);
      // console.log(position);
      const [x, z] = position;
      // const roomWidth = (path === 'sculpture' || path === 'death') ? 55 : 28;
      const wallOffset = roomWidth / 2;
      const showRoom = selectedRoom === 'all' || selectedRoom === path;
      if (!showRoom) return;
      
    
      const floorWidth = roomWidth + 4;
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(floorWidth, 36), 
        new THREE.MeshStandardMaterial({ map: woodTexture })
      );

      floor.rotation.x = -Math.PI / 2;
      floor.position.set(x, 0, z);
      scene.add(floor);

      const fontLoader = new FontLoader();

      fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(name.toUpperCase(), {
          font: font,
          size: 1.2,
          height: 0.1,
          curveSegments: 12,
        });

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x - name.length * 0.3, 10.5, z - 14.5);
        scene.add(textMesh);
      });


      const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(roomWidth + 4, 10), 
        wallMaterial);
      backWall.position.set(x, 5, z - 15);
      scene.add(backWall);

      // const spotlight = new THREE.SpotLight(new THREE.Color(0xffffff), 5, 10, Math.PI / 4, 0.3);
      // spotlight.position.set(x, 5, z - 5);
      // spotlight.position.set(x, 13, z - 15);
      // spotlight.castShadow = true;
      // spotlight.angle = Math.PI / 4;
      // spotlight.add(new THREE.SpotLightHelper(spotlight)) 
      // scene.add(spotlight);
      // spotlight.target.position.set(x, 5, z - 5);
      // scene.add(spotlight.target);

      if (selectedRoom !== 'all') {
        const backWall = new THREE.Mesh(
          new THREE.PlaneGeometry(roomWidth, 10), 
          wallMaterial);
        backWall.position.set(x, 5, z - 15);
        scene.add(backWall);

        const rightWall = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 10), 
          wallMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(x + wallOffset, 5, z - 15); 
        scene.add(rightWall);

        const leftWall = new THREE.Mesh(
          new THREE.PlaneGeometry(30, 10), 
          wallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(x - wallOffset, 5, z - 15); 
        scene.add(leftWall);
      }

      const images = wallArtworkByRoom[path];
      const total = images.length;
      const spacing = 5.2;
      const startX = x - (total * spacing) / 2 + spacing /2;

      images.forEach((img, i) => {
        const posX = startX + i * spacing;
        const posZ = z - 10;
        const tex = loader.load(`assets/${path}/${img}`);

        const frame = new THREE.Mesh(
          new THREE.PlaneGeometry(4.2, 4.2), 
          frameMaterial
        );
        frame.renderOrder = 0;
        frame.position.z = -0.01;
      
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 4),
          new THREE.MeshStandardMaterial({
            map: tex,
            transparent: false,
            depthWrite: true,
            depthTest: true,
            side: THREE.FrontSide,
            opacity: 1
          })
        );
        
        mesh.renderOrder = 1;
        mesh.position.z = 0;

        mesh.userData = {
          title: img,
          author: 'Unknown',
          location: 'SCSU Art Gallery',
          year: '2025',
          isArtwork: true    
        };
       
        const group = new THREE.Group();
        group.add(frame);
        group.add(mesh);
        group.position.set(posX, 5, posZ);
        scene.add(group);

        const spotlight = new THREE.SpotLight(0xffffff, 1.5, 12, Math.PI / 6, 0.2);
        spotlight.position.set(posX, 9, posZ); // Above the image
        spotlight.target = group;
        scene.add(spotlight);
        scene.add(spotlight.target);
        
      });
    })

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        mount.addEventListener('mousemove', (event) => {

          pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(pointer, camera.current);
        
          const intersects = raycaster.intersectObjects(scene.children, true);
          const hover = intersects.find(obj => obj.object.userData && obj.object.userData.isArtwork);
        
          if (hover) {
            mount.style.cursor = 'pointer';
            hover.object.scale.set(1.05, 1.05, 1.05); 

          } else {
            mount.style.cursor = 'default';
            scene.children.forEach(child => {
              if (child.type === 'Group') {
                child.children.forEach(obj => {
                  if (obj.userData?.isArtwork) {
                    obj.scale.set(1, 1, 1);
                  }
                });
              }
            }); 
          }
        });
          

        mount.addEventListener('click', (event) => {
          pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
          
          raycaster.setFromCamera(pointer, camera.current);
        
          const intersects = raycaster.intersectObjects(scene.children, true);
          const clicked = intersects.find(obj => obj.object.userData?.isArtwork);
        
          if (clicked) {
            setInfoBox(clicked.object.userData); // this works now
            setZoomedObject(null);
          }          
        });
    
    const controls = new OrbitControls(camera.current, renderer.domElement);
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;

    const joystickManager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { right: '40px', bottom: '20px' },
      color: '#0165FC',
      size: 80
    });
    
    let moveDirection = { x: 0, z: 0 };
    joystickManager.on('move', (evt, data) => {
      if (data.direction) {
        const angle = data.angle.radian;
        const speed = 0.20; 
        moveDirection.x = Math.cos(angle) * speed;  
        moveDirection.z = -Math.sin(angle) * speed;
      }
    });
    
    joystickManager.on('end', () => moveDirection = { x: 0, z: 0 });

    const animate = () => {
      requestAnimationFrame(animate);
      if (!zoomedObject) {
        camera.current.position.x += moveDirection.x;
        camera.current.position.z += moveDirection.z;
      } else {
        const { x, y, z } = zoomedObject.position;
        camera.current.position.lerp(new THREE.Vector3(x, y, z + 50), 0.5);
        camera.current.lookAt(zoomedObject.position);
      }

      renderer.render(scene, camera.current);
    };
    animate();

    const handleResize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild); 
      }
      window.removeEventListener('resize', handleResize);
      joystickManager.destroy(); 
    };
    
  }, [selectedRoom, darkMode, zoomedObject]);

  const filteredRooms = selectedRoom === 'all'
  ? Object.entries(artworksByRoom)
  : [[selectedRoom, artworksByRoom[selectedRoom]]];

  
  return (
    <>
    <header style={{
      textAlign: 'center',
      fontSize: '2.5rem',
      marginTop: '1rem',
      padding: '1rem',
      fontWeight: 'bold',
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: darkMode ? '#121212' : '#f0f0f0',
      color: darkMode ? '#fff' : '#222',
      borderBottom: darkMode ? '1px solid #444' : '1px solid #ccc'
    }}>
      ✨ Welcome to the Fourth Room Gallery 🎨
    </header>

    <main className="font-poppins" style={{ backgroundColor: darkMode ? '#121212' : '#fff', color: darkMode ? '#fff' : '#000' }}>
      <div style={{ border: '2px solid #ccc', borderRadius: '12px', overflow: 'hidden', margin: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ position: 'relative', height: '60vh' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
          <div ref={joystickRef} style={{ position: 'absolute', right: '80%', bottom: '20px', transform: 'translateX(-50%)', width: 100, height: 100, zIndex: 1000 }} />
        </div>
      </div>

      {infoBox && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)', 
          // position: 'absolute', 
          // top: '20px', 
          // right: '20px', 
          backgroundColor: '#222', 
          color: '#fff', 
          padding: '20px', 
          borderRadius: '12px', 
          zIndex: 1001, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <h3 style={{ marginBottom: '10px' }}>🖼️ {infoBox.title}</h3>
          <p>👤 <strong>Author:</strong> {infoBox.author}</p>
          <p>📍 <strong>Location:</strong> {infoBox.location}</p>
          <p>📅 <strong>Year:</strong> {infoBox.year}</p>
          <button
  onClick={() => {
    if (zoomedObject) {
  if (zoomedObject.userData.originalScale) {
    zoomedObject.scale.copy(zoomedObject.userData.originalScale);
  }
  if (zoomedObject.userData.originalPosition) {
    zoomedObject.position.copy(zoomedObject.userData.originalPosition);
  }
}
setZoomedObject(null);
setInfoBox(null);

  }}
  style={{
    marginTop: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  }}
>
  Close
</button>

        </div>
      )}
          
{showInstructions && (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#222',
    color: '#fff',
    padding: '20px',
    borderRadius: '12px',
    zIndex: 1001,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    maxWidth: '300px',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  }}>
    <h3 style={{ marginBottom: '10px' }}>ℹ️ Gallery Instructions</h3>
    <ul style={{ paddingLeft: '1rem' }}>
      <li>🕹️ Use the <strong>joystick</strong> to walk around the 3D gallery.</li>
      <li>📂 The <strong>dropdown</strong> filters both the virtual gallery and the photo grid below.</li>
      <li>🚪 The <strong>room buttons</strong> will navigate to a room but if it doesn't center on the screen use the joystick to adjust.</li>
      <li>🖼️ <strong>First, zoom in on any artwork</strong>then click to view details.</li>
      <li>💡 If you get stuck in a room or in zoom, <strong>refresh</strong> the browser.</li>
      <li>❌ Use the <strong>Close</strong> button to exit zoom view.</li>
    </ul>
    <button
      onClick={() => setShowInstructions(false)}
      style={{
        marginTop: '10px',
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer'
      }}
    >
      Got it!
    </button>
  </div>
)}

    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
    <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} style={{ padding: '0.5rem', fontSize: '1rem' }}>
    {/* <select 
      value={selectedRoom} 
      onChange={(e) => {
        setSelectedRoom(e.target.value);  // Update the selected room state
        const room = e.target.value; // Get the selected room value
        console.log('Selected room:', room); // Log the selected room value
        switch (room) {
          case 'all':
            camera.current.position.set(0, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(0, 5, 70));
            break;
          case 'color':
            camera.current.position.set(0, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(0, 5, 70));
            break;
          case 'bw':
            camera.current.position.set(40, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(40, 5, 70));
            break;
          case 'sculpture':
            camera.current.position.set(80, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(80, 5, 70));
            break;
          case 'death':
            camera.current.position.set(120, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(120, 5, 70));
            break;
          default:
            camera.current.position.set(0, 5, 70);  
            camera.current.lookAt(new THREE.Vector3(0, 5, 70));
        }
      }} 
      style={{ padding: '0.5rem', fontSize: '1rem' }}> */}
    <option value="all">All Rooms</option>
    {Object.keys(artworksByRoom).map(room => (
      <option key={room} value={room}>{room.charAt(0).toUpperCase() + room.slice(1)}</option>
    ))}
  </select>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowInstructions(true)}
              className="font-poppins bg-green-600 text-white px-4 py-2 rounded-md"
              style={{
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              📋 Instructions
            </button>

            <button
            onClick={() => {
              console.log(selectedRoom);
              const room = selectedRoom;
              switch (room) {
                case 'all':
                  camera.current.position.set(0, 5, 100);  
                  camera.current.lookAt(new THREE.Vector3(0, 5, 100));
                  break;
                case 'color':
                  camera.current.position.set(0, 5, 70);  
                  camera.current.lookAt(new THREE.Vector3(0, 5, 70));
                  break;
                case 'bw':
                  camera.current.position.set(40, 5, 70);  
                  camera.current.lookAt(new THREE.Vector3(40, 5, 70));
                  break;
                case 'sculpture':
                  camera.current.position.set(80, 5, 70);  
                  camera.current.lookAt(new THREE.Vector3(80, 5, 70));
                  break;
                case 'death':
                  camera.current.position.set(120, 5, 70);  
                  camera.current.lookAt(new THREE.Vector3(120, 5, 70));
                  break;
                default:
                  camera.current.position.set(0, 5, 70);  
                  camera.current.lookAt(new THREE.Vector3(0, 5, 70));
              }  
            }}
            style={{
              backgroundColor: '#4caf50',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🧭 Recenter View
          </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                backgroundColor: darkMode ? '#333' : '#eee',
                color: darkMode ? '#fff' : '#000',
                border: '1px solid #aaa',
                borderRadius: '6px'
              }}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

          </div>
        </div>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0 2rem' }}>
      {Object.keys(artworksByRoom).map((room) => (
        <button
          key={room}
          onClick={() => {
            console.log('Selected room:', room);
            // setSelectedRoom(room);
            // const pos = roomPositions[room];

            switch (room) {
              case 'all':
                camera.current.position.set(0, 5, 20);  
                camera.current.lookAt(new THREE.Vector3(0, 0, 10));
                break;
              case 'color':
                camera.current.position.set(0, 5, 30);
                camera.current.lookAt(new THREE.Vector3(0, 0, 10));
                break;
              case 'bw':
                camera.current.position.set(40, 5, 30);  
                camera.current.lookAt(new THREE.Vector3(40, 0, 10));
                break;
              case 'sculpture':
                camera.current.position.set(80, 5, 30);  
                camera.current.lookAt(new THREE.Vector3(80, 0, 10));
                break;
              case 'death':
                camera.current.position.set(120, 5, 30);  
                camera.current.lookAt(new THREE.Vector3(120, 0, 10));
                break;
              default:
                camera.current.position.set(0, 5, 30);  
                camera.current.lookAt(new THREE.Vector3(0, 5, 10));
            }  

            // if (camera.current && pos) {
            //   camera.current.position.copy(pos.clone().add(new THREE.Vector3(0, 4, 30)));
            //   camera.current.lookAt(pos);
            // }
          }}
          title={room}
          style={{
            backgroundColor: darkMode ? '#333' : '#e0e0e0',
            color: darkMode ? '#fff' : '#000',
            border: '1px solid #aaa',
            borderRadius: '10px',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {room === 'color' && '🎨'}
          {room === 'bw' && '🖤'}
          {room === 'sculpture' && '🗿'}
          {room === 'death' && '💀'}
          {room.charAt(0).toUpperCase() + room.slice(1)}
        </button>
      ))}
    </div>


      <section style={{ padding: '2rem', backgroundColor: darkMode ? '#1c1c1c' : '#fafafa' }}>
      {filteredRooms.map(([room, images]) => (
    <div key={room} style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{room.charAt(0).toUpperCase() + room.slice(1)}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {room === 'sculpture'
          ? Object.entries(images.reduce((acc, img) => {
              const base = img.split('_')[0];
              if (!acc[base]) acc[base] = [];
              acc[base].push(img);
              return acc;
            }, {}))
            .map(([base, stack], index) => (
              <SculptureStack key={index} stack={stack} />
            ))
            
          : images.map((imgName) => (
              <div key={imgName} style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={`assets/${room}/${imgName}`} alt={imgName} style={{ width: '100%', maxHeight: '200px' }} />
                <p style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{imgName}</p>
              </div>
            ))}
      </div>
    </div>
  ))}
</section>
    </main>
    </>
  );
};

const SculptureStack = ({ stack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden',}}>
      <img
        src={`assets/sculpture/${stack[currentIndex]}`}
        alt={stack[currentIndex]}
        style={{ width: '100%', maxHeight: '200px',  objectFit: 'cover' }}
      />
      <p style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{stack[currentIndex]}</p>
      {stack.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: currentIndex === 0 ? '#aaa' : '#4caf50',
              color: '#fff',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ◀
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(currentIndex + 1, stack.length - 1))}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: currentIndex === stack.length - 1 ? '#aaa' : '#4caf50',
              color: '#fff',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ▶
          </button>
        </>
      )}
    </div>
  
  );
};


export default GalleryScene;
