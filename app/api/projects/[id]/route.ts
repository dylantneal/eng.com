import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Enhanced mock projects for individual project pages
const ENHANCED_MOCK_PROJECTS = {
  'arduino-weather-station': {
    id: 'demo-1',
    slug: 'arduino-weather-station',
    title: 'Arduino Weather Station',
    description: 'A comprehensive IoT weather monitoring system built with Arduino, featuring real-time data collection, wireless transmission, and web-based dashboard visualization.',
    readme: '# Arduino Weather Station\n\nThis project creates a complete weather monitoring system using Arduino and various sensors.\n\n## Features\n- Temperature and humidity monitoring with DHT22 sensor\n- Atmospheric pressure sensing with BMP280\n- Wind speed and direction measurement\n- Data logging to SD card for offline storage\n- WiFi connectivity for remote monitoring via ESP8266\n\n## Hardware Components\n- Arduino Uno microcontroller\n- DHT22 temperature/humidity sensor\n- BMP280 pressure sensor\n- Anemometer for wind measurement\n- ESP8266 WiFi module\n- SD card module for data logging\n- LCD display for local readings\n\n## Software Features\n- Real-time sensor data collection\n- Web-based dashboard\n- Historical data visualization\n- Mobile-responsive interface\n- REST API for data access\n\n## Setup Instructions\n1. Connect all sensors according to the provided wiring diagram\n2. Upload the Arduino sketch to your board\n3. Configure WiFi credentials in the code\n4. Access the web dashboard at the device IP address\n\n## Files Included\n- Arduino source code\n- PCB design files\n- 3D printable enclosure\n- Web dashboard code\n- Complete documentation',
    discipline: 'Electrical Engineering',
    tags: ['arduino', 'iot', 'sensors', 'weather', 'electronics'],
    license: 'MIT',
    image_url: 'https://picsum.photos/seed/weather-station/600/400',
    view_count: 1280,
    like_count: 47,
    download_count: 245,
    is_public: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    owner_id: 'demo-user-1',
    author_id: 'demo-user-1',
    author: {
      id: 'demo-user-1',
      display_name: 'Demo Engineer',
      username: 'demo_engineer',
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    visibility: 'Public',
    version_count: 3,
    forked_from: null,
    files: [
      {
        id: 'file-1',
        name: 'weather_station.ino',
        type: 'code',
        size: 15420,
        url: '/files/weather_station.ino',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'file-2',
        name: 'pcb_design.kicad_pro',
        type: 'pcb',
        size: 48920,
        url: '/files/pcb_design.kicad_pro',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'file-3',
        name: 'enclosure.stl',
        type: 'cad',
        size: 2048000,
        url: '/files/enclosure.stl',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'file-4',
        name: 'wiring_diagram.pdf',
        type: 'doc',
        size: 512000,
        url: '/files/wiring_diagram.pdf',
        created_at: '2024-01-15T10:00:00Z',
      }
    ],
  },
  '3d-printed-robot-arm': {
    id: 'demo-2',
    slug: '3d-printed-robot-arm',
    title: '3D Printed Robot Arm',
    description: 'A 6-axis robotic arm designed for educational purposes, featuring 3D printed components, servo control, and Arduino-based motion planning with inverse kinematics.',
    readme: '# 3D Printed Robot Arm\n\nA fully functional 6-axis robotic arm that can be 3D printed and assembled at home.\n\n## Features\n- 6 degrees of freedom for complex movements\n- Servo-driven joints with precise control\n- Inverse kinematics calculations for path planning\n- Pick and place capabilities\n- Educational programming examples\n- Modular design for easy maintenance\n\n## Bill of Materials\n- PLA filament for 3D printing (approximately 500g)\n- 6x MG996R servo motors\n- Arduino Mega 2560 microcontroller\n- PCA9685 servo driver board\n- 7.4V 2A power supply\n- Various M3 screws and nuts\n- 608 bearings for smooth rotation\n\n## Assembly Process\n1. 3D print all structural components\n2. Install bearings and hardware in joints\n3. Mount servo motors in designated positions\n4. Connect all electronics according to wiring diagram\n5. Upload control software to Arduino\n6. Calibrate joint positions and test movements\n\n## Software Features\n- Inverse kinematics solver\n- Path planning algorithms\n- Manual joint control\n- Pre-programmed sequences\n- Serial communication interface\n\n## Applications\n- Educational robotics projects\n- Pick and place operations\n- Drawing and writing\n- Object manipulation studies',
    discipline: 'Mechanical Engineering',
    tags: ['robotics', '3d-printing', 'mechanical', 'automation', 'education'],
    license: 'MIT',
    image_url: 'https://picsum.photos/seed/robot-arm/600/400',
    view_count: 3420,
    like_count: 156,
    download_count: 892,
    is_public: true,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
    owner_id: 'demo-user-1',
    author_id: 'demo-user-1',
    author: {
      id: 'demo-user-1',
      display_name: 'Demo Engineer',
      username: 'demo_engineer',
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    visibility: 'Public',
    version_count: 2,
    forked_from: null,
    files: [
      {
        id: 'file-1',
        name: 'base.stl',
        type: 'cad',
        size: 1048576,
        url: '/files/base.stl',
        created_at: '2024-01-10T14:30:00Z',
      },
      {
        id: 'file-2',
        name: 'arm_segment_1.stl',
        type: 'cad',
        size: 856432,
        url: '/files/arm_segment_1.stl',
        created_at: '2024-01-10T14:30:00Z',
      },
      {
        id: 'file-3',
        name: 'control_software.ino',
        type: 'code',
        size: 25600,
        url: '/files/control_software.ino',
        created_at: '2024-01-10T14:30:00Z',
      },
      {
        id: 'file-4',
        name: 'assembly_guide.pdf',
        type: 'doc',
        size: 2048000,
        url: '/files/assembly_guide.pdf',
        created_at: '2024-01-10T14:30:00Z',
      }
    ],
  },
  'pcb-design-iot-sensor': {
    id: 'demo-3',
    slug: 'pcb-design-iot-sensor',
    title: 'PCB Design for IoT Sensor',
    description: 'Professional PCB design for a multi-sensor IoT device with ESP32, environmental sensors, and power management.',
    readme: '# IoT Sensor PCB\n\nProfessional PCB design for a complete IoT sensing solution.\n\n## Features\n- ESP32-S3 microcontroller with WiFi and Bluetooth\n- Multiple sensor interfaces (I2C, SPI, analog)\n- Power management with battery backup\n- Compact form factor (50mm x 30mm)\n- Professional-grade design with proper grounding\n\n## Supported Sensors\n- SHT30 temperature and humidity sensor\n- CCS811 air quality sensor\n- TSL2561 light sensor\n- MPU6050 accelerometer/gyroscope\n- PIR motion detection\n- Analog inputs for custom sensors\n\n## Power Management\n- USB-C charging port\n- LiPo battery support (3.7V)\n- Low power sleep modes\n- Solar panel input option\n- Power monitoring and reporting\n\n## Connectivity\n- WiFi 802.11 b/g/n\n- Bluetooth Low Energy\n- MQTT support\n- REST API\n- OTA firmware updates\n\n## Files Included\n- Complete KiCad project files\n- Gerber files ready for manufacturing\n- Bill of materials with part numbers\n- Assembly drawings and instructions\n- Example firmware code\n- 3D printable enclosure',
    discipline: 'Electrical Engineering',
    tags: ['pcb', 'iot', 'esp32', 'sensors', 'electronics'],
    license: 'MIT',
    image_url: 'https://picsum.photos/seed/pcb-iot/600/400',
    view_count: 890,
    like_count: 34,
    download_count: 127,
    is_public: true,
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z',
    owner_id: 'demo-user-2',
    author_id: 'demo-user-2',
    author: {
      id: 'demo-user-2',
      display_name: 'PCB Expert',
      username: 'pcb_expert',
      avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    visibility: 'Public',
    version_count: 1,
    forked_from: null,
    files: [
      {
        id: 'file-1',
        name: 'iot_sensor.kicad_pro',
        type: 'pcb',
        size: 42000,
        url: '/files/iot_sensor.kicad_pro',
        created_at: '2024-01-05T09:15:00Z',
      },
      {
        id: 'file-2',
        name: 'gerbers.zip',
        type: 'archive',
        size: 156000,
        url: '/files/gerbers.zip',
        created_at: '2024-01-05T09:15:00Z',
      },
      {
        id: 'file-3',
        name: 'firmware.ino',
        type: 'code',
        size: 18900,
        url: '/files/firmware.ino',
        created_at: '2024-01-05T09:15:00Z',
      },
      {
        id: 'file-4',
        name: 'bom.csv',
        type: 'doc',
        size: 8450,
        url: '/files/bom.csv',
        created_at: '2024-01-05T09:15:00Z',
      }
    ],
  }
};

export async function GET(
  request: Request,
  ctx: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { id: slug } = await ctx.params;

    // Try to fetch real project data first
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`*, author:profiles(id, display_name, username, avatar_url)`)
        .eq('slug', slug)
        .single();

      if (!projectError && project) {
        console.log(`✅ Returning real project data for: ${slug}`);
        
        // Increment view count
        await supabase
          .from('projects')
          .update({ view_count: (project.view_count || 0) + 1 })
          .eq('slug', slug);

        // Add mock files if none exist
        const projectWithFiles = {
          ...project,
          author: project.author || {
            id: project.author_id,
            display_name: 'Unknown Author',
            username: '',
            avatar_url: '',
          },
          visibility: project.visibility || 'Public',
          version_count: project.version_count ?? 1,
          forked_from: project.forked_from || null,
          files: project.files || [
            {
              id: 'file-1',
              name: 'README.md',
              type: 'doc',
              size: 2048,
              url: '/files/readme.md',
              created_at: project.created_at,
            }
          ],
        };
        
        return NextResponse.json(projectWithFiles);
      }
    } catch (dbError) {
      console.log(`Database query failed for ${slug}, using mock data:`, dbError);
    }

    // Fallback to enhanced mock data
    const mockProject = ENHANCED_MOCK_PROJECTS[slug as keyof typeof ENHANCED_MOCK_PROJECTS];
    
    if (mockProject) {
      console.log(`📊 Returning enhanced mock data for: ${slug}`);
      return NextResponse.json(mockProject);
    }

    // Generic fallback for any slug not in our mock data
    const genericMockProject = {
      id: 'demo-generic',
      slug,
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `This is a demonstration project for ${slug.replace(/-/g, ' ')}. This would contain real project data in a production environment.`,
      readme: `# ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nThis is a demonstration project showing the structure and capabilities of the Eng.com platform.\n\n## Features\n- Professional project hosting\n- Version control for hardware projects\n- File management and sharing\n- Collaboration tools\n\n## About This Demo\nThis is mock data used to demonstrate the platform functionality. In a real environment, this would contain actual project files, documentation, and collaboration history.`,
      author_id: 'demo-user-1',
      author: {
        id: 'demo-user-1',
        display_name: 'Demo Engineer',
        username: 'demo_engineer',
        avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['demo', 'hardware', 'engineering'],
      discipline: 'Engineering',
      visibility: 'Public',
      version_count: 1,
      forked_from: null,
      view_count: Math.floor(Math.random() * 1000),
      like_count: Math.floor(Math.random() * 50),
      download_count: Math.floor(Math.random() * 200),
      files: [
        {
          id: 'file-1',
          name: 'README.md',
          type: 'doc',
          size: 2048,
          url: '/files/readme.md',
          created_at: new Date().toISOString(),
        },
        {
          id: 'file-2',
          name: 'main_design.step',
          type: 'cad',
          size: 1048576,
          url: '/files/main_design.step',
          created_at: new Date().toISOString(),
        }
      ],
    };

    return NextResponse.json(genericMockProject);
    
  } catch (error) {
    console.error('Error in project API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 