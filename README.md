# NetSim

## Project Overview
NetSim is a virtual network simulation and distributed task execution platform that provides a controlled environment for experimenting with network topologies, communication protocols, and distributed computing concepts. The system is intended for academic, research, and development use where practical experimentation and visualization of network behavior are required.

## Problem It Solves
Existing network simulation tools are often costly, complex to configure, or limited in real-time interaction and distributed task execution. NetSim addresses these limitations by offering a simplified yet functional platform that enables users to design custom network topologies, analyze protocol behavior, and evaluate distributed task execution without requiring specialized hardware or enterprise-level tools.

## Target Users (Personas)
- Students learning computer networks and distributed systems
- Researchers conducting experiments on network behavior and protocol efficiency
- Software developers testing network-aware and distributed applications
- Educators designing laboratory exercises and demonstrations

## Vision Statement
To provide an accessible, secure, and practical network simulation platform that enables learning, experimentation, and evaluation of distributed systems and network architectures.

## Key Features / Goals
- Role-based user access control
- Manual creation and visualization of network topologies (mesh, star, ring)
- Support for testing communication protocols such as TCP, UDP, and custom protocols
- Distributed task execution and benchmarking
- Real-time monitoring of nodes, data flow, and task execution
- Secure peer-to-peer communication features such as file sharing and messaging

## Success Metrics
- Successful creation and visualization of custom network topologies
- Correct protocol communication under different simulated conditions
- Accurate execution and benchmarking of distributed tasks
- Stable system performance during multi-user simulations
- Clear and usable user interface

## Assumptions & Constraints

### Assumptions
- Users have access to standard computing systems
- Network participants operate within defined access permissions
- The platform targets small to medium-scale simulations

### Constraints
- Must operate within limited hardware resources
- Development follows an academic, time-bound schedule
- Real-world network behavior may be approximated

## Risks
- Increasing system complexity as features expand
- Security concerns in peer-to-peer communication
- Variability in performance due to node availability

---

## Branching Strategy

This project follows **GitHub Flow**. The `main` branch is the primary branch and contains the production-ready code.

For new features, bug fixes, or enhancements:
1. Create a new branch off `main` (e.g., `feature/login-system`).
2. Make your commits and push the branch to GitHub.
3. Open a Pull Request (PR) against the `main` branch.
4. Review the code and merge it into `main`.

---

## Quick Start – Local Development

### Requirements
- You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your device.

### Running with Docker Compose

1. Build and run the containers using Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - **Frontend:** http://localhost:5173
   - **Backend:** http://localhost:3000

To stop the containers, use `Ctrl+C` in the terminal where it's running, or open another terminal in the directory and run:
```bash
docker-compose down
```
