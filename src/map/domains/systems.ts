// name | aliases | kind | year | weight | definition | related
export default `
@Operating systems
Operating System | os, operating systems | c | 1956 | 3 | The software that runs a computer and shares it among programs. | Kernel; Linux; Process and Thread
Linux | gnu/linux, ubuntu, debian | t | 1991 | 3 | The open-source kernel that runs most of the internet. | Unix; Kernel; Open Source
Unix | | t | 1971 | 3 | The operating system that shaped nearly all that followed. | Linux; C; Unix Philosophy
Windows | windows 11 | t | 1985 | 2 | Microsoft's desktop operating system. | Operating System; WSL
macOS | osx, mac os, os x | t | 2001 | 2 | Apple's Unix-based desktop operating system. | Unix; Apple Silicon
Kernel | kernels | c | 1960 | 3 | The core of an OS, sitting between programs and hardware. | Operating System; System Call
Process and Thread | process, processes, thread, threads, threading | c | 1965 | 3 | The units of work an operating system schedules. | Concurrency; Operating System
Virtual Memory | paging | c | 1961 | 2 | Giving each program the illusion of its own memory. | Operating System; RAM
File System | filesystem, file systems, ext4, zfs, ntfs | c | 1965 | 2 | How data is organised and stored on disk. | Operating System; SSD
System Call | syscall, syscalls | c | 1970 | 2 | How a program asks the kernel to do something. | Kernel
eBPF | ebpf | t | 2014 | 1 | Running safe custom programs inside the Linux kernel. | Linux; Observability
Virtual Machine | vm, vms, hypervisor, virtualization, virtualisation | c | 1967 | 3 | A complete computer simulated in software. | Containers; EC2
WSL | windows subsystem for linux | t | 2016 | 1 | A real Linux environment inside Windows. | Windows; Linux
Semaphores and Mutexes | mutex, mutexes, semaphore, semaphores, locks, deadlock, race condition | c | 1965 | 2 | Tools that stop threads tripping over each other. | Process and Thread; Concurrency
Stack and Heap | stack, heap, call stack | c | 1960 | 2 | The two regions where a program keeps its memory. | Garbage Collection; Recursion
Mainframe | mainframes, ibm z | t | 1952 | 1 | The large, ultra-reliable computers still running banks. | COBOL; Virtual Machine

@Networking
TCP/IP | tcp, ip, internet protocol, tcp ip | s | 1974 | 3 | The core protocols that move data across the internet. | HTTP; DNS; OSI Model
UDP | | s | 1980 | 2 | A fast protocol that doesn't guarantee delivery. | TCP/IP; HTTP/3
HTTP | http/1.1, http 1.1 | s | 1991 | 3 | The request and response protocol of the web. | HTTPS; REST; TCP/IP
HTTPS | | s | 1994 | 3 | HTTP encrypted with TLS. | HTTP; TLS
HTTP/2 | http2 | s | 2015 | 2 | A faster HTTP that multiplexes over one connection. | HTTP; gRPC
HTTP/3 | http3, quic | s | 2021 | 2 | HTTP running on QUIC instead of TCP. | HTTP/2; UDP
DNS | domain name system | s | 1983 | 3 | The internet's phone book, turning names into addresses. | TCP/IP; CDN
IPv6 | ipv4, ip address, ip addresses | s | 1998 | 2 | Internet addressing with vastly more addresses. | TCP/IP; NAT
OSI Model | osi | c | 1984 | 2 | The seven-layer way of describing a network. | TCP/IP
BGP | border gateway protocol | s | 1989 | 1 | How the internet's networks tell each other about routes. | Router
Router | routing, routers, network switch | c | 1980 | 2 | A device that passes traffic between networks. | BGP; NAT
NAT | network address translation | c | 1994 | 2 | Letting many devices share one public address. | IPv6; Router
Proxy | reverse proxy, forward proxy, proxies | c | 1995 | 2 | A server that sits between clients and other servers. | Nginx; Load Balancing
SSH | secure shell | s | 1995 | 3 | Secure remote login to another machine. | Public-Key Cryptography; Command Line
Wi-Fi | wifi, 802.11, wi fi | s | 1997 | 2 | Wireless networking for local areas. | Router
5G | 5g networks | s | 2019 | 2 | The fifth generation of mobile networks. | Edge Computing
Bluetooth | ble | s | 1999 | 1 | Short-range wireless between nearby devices. | Internet of Things
Starlink | | t | 2019 | 1 | SpaceX's satellite internet network. | Router

@Chips & compute
CPU | processor, cpus | c | 1971 | 3 | The chip that carries out a program's instructions. | Instruction Set; CPU Cache; GPU
GPU | gpus, graphics card, graphics cards | c | 1999 | 3 | A chip that does thousands of calculations at once. | NVIDIA; Deep Learning; Shaders
NPU | tpu, ai accelerator, ai chip, neural processing unit | c | 2016 | 2 | A chip built specifically for AI workloads. | GPU; Inference
RAM | memory, dram, ddr5 | c | 1968 | 3 | The fast, temporary memory a computer works in. | CPU; CPU Cache; Virtual Memory
SSD | nvme, flash storage | c | 2009 | 2 | Fast storage with no moving parts. | File System
CPU Cache | l1 cache, l2 cache | c | 1985 | 2 | Tiny, very fast memory right beside the processor. | CPU; Caching
Instruction Set | isa, instruction set architecture | c | 1964 | 2 | The commands a processor understands. | x86; ARM; RISC-V
x86 | x86-64, amd64, x64 | s | 1978 | 2 | The instruction set of Intel and AMD chips. | Instruction Set; ARM
ARM | arm64, aarch64 | s | 1985 | 3 | The power-efficient chip design in phones and new laptops. | Instruction Set; Apple Silicon
RISC-V | riscv, risc v | s | 2015 | 2 | An open, free instruction set. | Instruction Set; Open Source
Apple Silicon | m1, m2, m3, m4 | t | 2020 | 2 | Apple's own ARM chips for Mac and iPhone. | ARM; macOS
NVIDIA | nvidia cuda, cuda | t | 2007 | 3 | The company and software platform at the heart of AI compute. | GPU; Deep Learning
Moore's Law | moores law | c | 1965 | 3 | The observation that chips double in density every two years. | Semiconductor
Semiconductor | semiconductors, chip, chips, tsmc, transistor, transistors | c | 1947 | 2 | The material and the industry behind every chip. | Moore's Law; CPU
FPGA | fpgas | c | 1985 | 1 | A chip that can be rewired after manufacture. | Semiconductor
SIMD | avx, neon | c | 1995 | 1 | One instruction that works on many values at once. | CPU
HBM | high bandwidth memory | c | 2013 | 1 | Stacked memory that feeds AI chips. | GPU; RAM
Data Center | datacenter, data centers, datacenters, data centre | c | 1990 | 2 | A building full of servers. | Cloud Computing; GPU

@Embedded & IoT
Embedded Systems | firmware, embedded | c | 1970 | 2 | Computers built into other products. | Microcontroller; RTOS
Microcontroller | mcu, esp32, stm32, microcontrollers | c | 1971 | 2 | A tiny computer on a single chip. | Arduino; Embedded Systems
Arduino | | t | 2005 | 2 | The friendly board that opened up electronics. | Microcontroller
Raspberry Pi | raspberrypi, rpi | t | 2012 | 2 | A credit-card-sized Linux computer. | Linux; Arduino
Internet of Things | iot | c | 1999 | 2 | Everyday objects connected to the network. | MQTT; Embedded Systems
RTOS | real-time operating system, real time operating system | c | 1980 | 1 | An OS that guarantees response times. | Embedded Systems
MQTT | | s | 1999 | 1 | A lightweight messaging protocol for devices. | Internet of Things
Digital Twin | digital twins | c | 2010 | 1 | A live virtual copy of a physical thing. | Internet of Things

@Frontier hardware
Quantum Computing | quantum, qubit, qubits, quantum computer | c | 1981 | 2 | Computing with quantum states instead of ordinary bits. | Post-Quantum Cryptography
Robotics | robots, robot | c | 1961 | 2 | Machines that sense and act in the physical world. | ROS; Humanoid Robots; Computer Vision
Humanoid Robots | humanoids, humanoid robot, optimus, figure ai | c | 2022 | 1 | Robots built in the shape of a person. | Robotics
ROS | robot operating system | t | 2007 | 1 | The standard open-source framework for robots. | Robotics
Self-Driving Cars | autonomous vehicles, self driving, lidar, waymo, autonomous driving | c | 2009 | 2 | Vehicles that drive without a human. | Computer Vision; Robotics
Neuromorphic Computing | neuromorphic | c | 2014 | 1 | Chips designed to work like neurons. | Neural Network
Brain-Computer Interface | bci, neuralink, brain computer interface | c | 2016 | 1 | Linking the brain directly to a computer. | Robotics
3D Printing | additive manufacturing, 3d printer | c | 1984 | 1 | Building objects layer by layer from a digital file. | Blender
Drones | uav, drone | c | 2010 | 1 | Aircraft flown by remote or by software. | Robotics
Edge AI | tinyml, on-device ai, on device ai | c | 2019 | 1 | Running AI on devices instead of in the cloud. | Small Language Model; NPU
`
