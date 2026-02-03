# CampusMaster
## Système de Gestion de Campus Éducatif

---

# Table des Matières

1. [Introduction](#1-introduction)
2. [Contexte et Problématique](#2-contexte-et-problématique)
3. [Objectifs du Projet](#3-objectifs-du-projet)
4. [Technologies Utilisées](#4-technologies-utilisées)
5. [Architecture du Système](#5-architecture-du-système)
6. [Modélisation UML](#6-modélisation-uml)
   - 6.1 [Diagramme de Cas d'Utilisation](#61-diagramme-de-cas-dutilisation)
   - 6.2 [Diagramme de Classes](#62-diagramme-de-classes)
   - 6.3 [Diagramme de Séquence - Dépôt de Devoir](#63-diagramme-de-séquence---dépôt-de-devoir)
   - 6.4 [Diagramme de Séquence - Correction de Devoir](#64-diagramme-de-séquence---correction-de-devoir)
7. [Fonctionnalités Implémentées](#7-fonctionnalités-implémentées)
8. [Base de Données](#8-base-de-données)
9. [Sécurité](#9-sécurité)
10. [Maquettes UI/UX](#10-maquettes-uiux)
11. [Interfaces Utilisateur](#11-interfaces-utilisateur)
12. [Conclusion et Perspectives](#12-conclusion-et-perspectives)

---

# 1. Introduction

## Présentation du Projet

**CampusMaster** est une plateforme de gestion de campus éducatif complète, conçue pour faciliter l'interaction entre les étudiants, les enseignants et les administrateurs dans un environnement d'apprentissage numérique moderne.

Ce système de gestion d'apprentissage (LMS - Learning Management System) offre une solution intégrée pour la gestion des cours, la soumission et la correction des devoirs, le suivi des notes et la gestion administrative d'un établissement d'enseignement supérieur.

## Équipe de Développement

| Nom | Rôle |
|-----|------|
|     |      |
|     |      |
|     |      |

## Date de Réalisation

**Année universitaire :** 2024-2025

**Niveau :** Master 2

---

# 2. Contexte et Problématique

## Contexte

Dans le contexte actuel de digitalisation de l'enseignement supérieur, les établissements éducatifs font face à plusieurs défis :

- **Gestion manuelle des cours et des devoirs** : processus chronophage et source d'erreurs
- **Communication inefficace** entre étudiants et enseignants
- **Difficulté de suivi** des performances académiques
- **Absence de centralisation** des ressources pédagogiques
- **Complexité de la gestion administrative** des inscriptions et des notes

## Problématique

> Comment concevoir et développer une plateforme web moderne permettant de centraliser et d'automatiser la gestion académique tout en offrant une expérience utilisateur optimale pour les différents acteurs (administrateurs, enseignants, étudiants) ?

## Solutions Proposées

- Développement d'une application web full-stack avec architecture moderne
- Mise en place d'un système de gestion des rôles et permissions
- Automatisation des workflows de soumission et correction de devoirs
- Stockage cloud sécurisé des fichiers et ressources pédagogiques
- Interface utilisateur intuitive et responsive

---

# 3. Objectifs du Projet

## Objectifs Principaux

### 3.1 Objectifs Fonctionnels

| N° | Objectif | Description |
|----|----------|-------------|
| 1 | Gestion des utilisateurs | Permettre l'inscription, l'authentification et la gestion des profils avec différents rôles |
| 2 | Gestion des cours | Créer, modifier, publier et gérer des cours avec leurs ressources |
| 3 | Gestion des devoirs | Créer des devoirs avec dates limites et pénalités de retard |
| 4 | Soumission des travaux | Permettre aux étudiants de soumettre leurs travaux en plusieurs versions |
| 5 | Notation et feedback | Permettre aux enseignants de noter et commenter les travaux |
| 6 | Gestion administrative | Administrer les départements, semestres et matières |

### 3.2 Objectifs Techniques

- Développer une API REST sécurisée avec Spring Boot
- Créer une interface utilisateur moderne avec Next.js
- Implémenter une authentification JWT robuste
- Intégrer un système de stockage cloud (Cloudinary)
- Assurer la scalabilité et la maintenabilité du code

### 3.3 Objectifs Qualitatifs

- Garantir la sécurité des données utilisateurs
- Offrir une expérience utilisateur fluide et intuitive
- Assurer la disponibilité et les performances du système
- Respecter les bonnes pratiques de développement

---

# 4. Technologies Utilisées

## 4.1 Stack Technique

### Frontend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Next.js** | 15.1.0 | Framework React avec App Router |
| **React** | 18.3.1 | Bibliothèque UI |
| **TypeScript** | 5.7.2 | Typage statique |
| **Tailwind CSS** | 3.4.17 | Framework CSS utilitaire |
| **ESLint** | - | Linting du code |

### Backend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Spring Boot** | 3.2.5 | Framework Java |
| **Java** | 17 | Langage de programmation |
| **Spring Security** | - | Sécurité et authentification |
| **Spring Data JPA** | - | ORM et accès aux données |
| **Hibernate** | - | Implémentation JPA |
| **JJWT** | 0.11.5 | Gestion des tokens JWT |
| **Lombok** | - | Réduction du code boilerplate |
| **Maven** | 3.8+ | Gestion des dépendances |

### Base de Données

| Technologie | Utilisation |
|-------------|-------------|
| **PostgreSQL** | Base de données principale (production) |
| **Aiven Cloud** | Hébergement PostgreSQL |
| **H2** | Base de données en mémoire (développement) |

### Services Cloud et Externes

| Service | Utilisation |
|---------|-------------|
| **Cloudinary** | Stockage et gestion des fichiers |
| **Gmail SMTP** | Envoi d'emails |
| **Docker** | Conteneurisation |

## 4.2 Architecture Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 15)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Pages      │  │  Components  │  │   Services API       │   │
│  │  (App Router)│  │  (React)     │  │   (Fetch + Auth)     │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Context    │  │    Types     │  │    Utils             │   │
│  │  (Auth)      │  │  (TypeScript)│  │   (Storage)          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                          HTTP/REST + JWT
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot 3.2)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Controllers │  │   Services   │  │   Security           │   │
│  │  (REST API)  │  │  (Métier)    │  │   (JWT Filter)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Entities   │  │     DAOs     │  │   Configuration      │   │
│  │   (JPA)      │  │  (Repository)│  │   (Security, CORS)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
         ┌──────────────────────┴──────────────────────┐
         │                      │                       │
         ▼                      ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   PostgreSQL    │   │   Cloudinary    │   │   Gmail SMTP    │
│   (Aiven)       │   │   (Fichiers)    │   │   (Emails)      │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

# 5. Architecture du Système

## 5.1 Architecture Globale

Le projet suit une **architecture en couches** (Layered Architecture) avec une séparation claire entre le frontend et le backend, communiquant via une API REST.

### Structure du Projet

```
CampusMaster/
│
├── Frontend/                          # Application Next.js
│   ├── src/
│   │   ├── app/                       # Pages (App Router)
│   │   │   ├── admin/                 # Pages administration
│   │   │   ├── auth/                  # Pages authentification
│   │   │   ├── user/                  # Pages étudiant
│   │   │   ├── teacher/               # Pages enseignant
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/                # Composants réutilisables
│   │   ├── context/                   # Contextes React
│   │   ├── services/                  # Services API
│   │   ├── types/                     # Types TypeScript
│   │   └── utils/                     # Utilitaires
│   ├── package.json
│   └── tailwind.config.js
│
├── Backend/                           # Application Spring Boot
│   ├── src/main/java/com/campusmaster/
│   │   ├── Controller/                # Contrôleurs REST
│   │   ├── Service/                   # Logique métier
│   │   ├── Entity/                    # Entités JPA
│   │   ├── DAO/                       # Repositories
│   │   ├── Configuration/             # Configurations
│   │   └── Util/                      # Utilitaires
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── docker-compose.yml
└── Makefile
```

## 5.2 Architecture Backend (Spring Boot)

### Couches de l'Application

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                       │
│              (Controllers - REST Endpoints)                  │
│  UserController, CourseController, AssignmentController...   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     COUCHE SERVICE                           │
│                   (Logique Métier)                           │
│  UserService, CourseService, AssignmentService, JwtService   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   COUCHE PERSISTANCE                         │
│                  (DAOs - Repositories)                       │
│     UserDAO, CourseDAO, AssignmentDAO, SubmissionDAO...      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                           │
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

## 5.3 Flux de Données

### Flux d'Authentification

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │───▶│ Frontend │───▶│ Backend  │───▶│   BDD    │
│          │    │          │    │          │    │          │
│  Login   │    │  API     │    │ Auth     │    │ Vérif.   │
│  Form    │◀───│  Call    │◀───│ Service  │◀───│ User     │
│          │    │          │    │          │    │          │
│  JWT     │    │  Store   │    │ Generate │    │          │
│  Token   │    │  Token   │    │ JWT      │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

# 6. Modélisation UML

## 6.1 Diagramme de Cas d'Utilisation

### Description des Acteurs

| Acteur | Description |
|--------|-------------|
| **Administrateur** | Gère les utilisateurs, les départements, les semestres et les matières. Approuve les comptes enseignants. |
| **Enseignant** | Crée et gère les cours, les ressources pédagogiques, les devoirs. Note les travaux des étudiants. |
| **Étudiant** | S'inscrit aux cours, consulte les ressources, soumet les devoirs, consulte ses notes. |
| **Système** | Envoie les notifications, gère les sessions, calcule les pénalités de retard. |

### Cas d'Utilisation par Acteur

#### Administrateur
- Gérer les utilisateurs (CRUD)
- Suspendre/Réactiver un compte
- Approuver les enseignants
- Gérer les départements
- Gérer les semestres
- Gérer les matières

#### Enseignant
- Créer/Modifier/Supprimer un cours
- Publier/Dépublier un cours
- Ajouter des ressources pédagogiques
- Créer/Modifier/Supprimer un devoir
- Consulter les soumissions
- Noter les travaux
- Donner un feedback

#### Étudiant
- S'inscrire / Se connecter
- Consulter les cours publiés
- S'inscrire à un cours
- Télécharger les ressources
- Soumettre un devoir
- Consulter ses notes et feedbacks

---

### [ESPACE POUR DIAGRAMME DE CAS D'UTILISATION]

> **Insérer ici le diagramme de cas d'utilisation (Use Case Diagram)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                     DIAGRAMME DE CAS D'UTILISATION                      │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Diagramme de Classes

### Description des Classes Principales

#### Entités Utilisateur

| Classe | Attributs Principaux | Relations |
|--------|---------------------|-----------|
| **User** | id, firstName, lastName, email, password, suspended, createdAt | Many-to-Many avec Role, One-to-Many avec Course, Submission |
| **Role** | id, name | Many-to-Many avec User |

#### Entités Académiques

| Classe | Attributs Principaux | Relations |
|--------|---------------------|-----------|
| **Course** | id, title, description, published, createdAt | Many-to-One avec User (teacher), One-to-Many avec CourseMaterial, Assignment, CourseEnrollment |
| **Subject** | id, name, code | Many-to-One avec Teacher, Department |
| **Department** | id, name, code | One-to-Many avec Subject |
| **Semester** | id, name, startDate, endDate, active | One-to-Many avec Course |

#### Entités Pédagogiques

| Classe | Attributs Principaux | Relations |
|--------|---------------------|-----------|
| **Assignment** | id, title, description, deadline, maxScore, lateSubmissionPenalty, published | Many-to-One avec Course, One-to-Many avec Submission |
| **Submission** | id, filePath, fileUrl, submittedAt, version, isLate | Many-to-One avec Assignment, User; One-to-One avec Grade |
| **Grade** | id, score, feedback, gradedAt, latePenaltyApplied | One-to-One avec Submission, Many-to-One avec User (grader) |
| **CourseMaterial** | id, title, description, fileUrl, fileType, fileSize, downloadCount | Many-to-One avec Course |
| **CourseEnrollment** | id, enrolledAt, status | Many-to-One avec Course, User |

---

### [ESPACE POUR DIAGRAMME DE CLASSES]

> **Insérer ici le diagramme de classes (Class Diagram)**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                         DIAGRAMME DE CLASSES                            │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6.3 Diagramme de Séquence - Dépôt de Devoir

### Description du Processus

Le processus de dépôt de devoir suit les étapes suivantes :

1. **L'étudiant** accède à la liste de ses devoirs
2. **Le système** affiche les devoirs disponibles
3. **L'étudiant** sélectionne un devoir et son fichier à soumettre
4. **Le frontend** envoie une requête avec le fichier au backend
5. **Le backend** vérifie l'authentification et les permissions
6. **Le backend** vérifie si la soumission est en retard
7. **Le CloudinaryService** upload le fichier vers Cloudinary
8. **Le SubmissionService** crée l'enregistrement de soumission
9. **Le système** retourne la confirmation à l'étudiant

### Composants Impliqués

- **Étudiant (Acteur)**
- **Frontend (Next.js)**
- **SubmissionController**
- **SubmissionService**
- **CloudinaryService**
- **SubmissionDAO**
- **Base de données**

---

### [ESPACE POUR DIAGRAMME DE SÉQUENCE - DÉPÔT DE DEVOIR]

> **Insérer ici le diagramme de séquence pour le dépôt de devoir**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│               DIAGRAMME DE SÉQUENCE - DÉPÔT DE DEVOIR                   │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Description Textuelle du Flux

```
Étudiant          Frontend          SubmissionController     SubmissionService     CloudinaryService     BDD
    │                 │                      │                      │                     │               │
    │  Soumettre      │                      │                      │                     │               │
    │  devoir         │                      │                      │                     │               │
    │────────────────▶│                      │                      │                     │               │
    │                 │   POST /submissions  │                      │                     │               │
    │                 │   + fichier          │                      │                     │               │
    │                 │─────────────────────▶│                      │                     │               │
    │                 │                      │  createSubmission()  │                     │               │
    │                 │                      │─────────────────────▶│                     │               │
    │                 │                      │                      │  uploadFile()       │               │
    │                 │                      │                      │────────────────────▶│               │
    │                 │                      │                      │     fileUrl         │               │
    │                 │                      │                      │◀────────────────────│               │
    │                 │                      │                      │  checkDeadline()    │               │
    │                 │                      │                      │─────────┐           │               │
    │                 │                      │                      │◀────────┘           │               │
    │                 │                      │                      │  save(submission)   │               │
    │                 │                      │                      │──────────────────────────────────▶│
    │                 │                      │                      │        OK           │               │
    │                 │                      │                      │◀──────────────────────────────────│
    │                 │                      │    Submission        │                     │               │
    │                 │                      │◀─────────────────────│                     │               │
    │                 │   201 Created        │                      │                     │               │
    │                 │◀─────────────────────│                      │                     │               │
    │   Confirmation  │                      │                      │                     │               │
    │◀────────────────│                      │                      │                     │               │
    │                 │                      │                      │                     │               │
```

---

## 6.4 Diagramme de Séquence - Correction de Devoir (Enseignant)

### Description du Processus

Le processus de correction de devoir par l'enseignant suit les étapes suivantes :

1. **L'enseignant** accède à la liste des soumissions d'un devoir
2. **Le système** affiche toutes les soumissions avec leur statut
3. **L'enseignant** sélectionne une soumission à corriger
4. **Le système** affiche les détails et le fichier soumis
5. **L'enseignant** télécharge le fichier pour correction
6. **L'enseignant** saisit la note et le feedback
7. **Le frontend** envoie la requête de notation au backend
8. **Le GradeService** calcule la pénalité de retard si applicable
9. **Le GradeService** crée/met à jour la note
10. **Le système** confirme la notation

### Composants Impliqués

- **Enseignant (Acteur)**
- **Frontend (Next.js)**
- **GradeController**
- **GradeService**
- **SubmissionService**
- **GradeDAO**
- **Base de données**

---

### [ESPACE POUR DIAGRAMME DE SÉQUENCE - CORRECTION DE DEVOIR]

> **Insérer ici le diagramme de séquence pour la correction de devoir**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│            DIAGRAMME DE SÉQUENCE - CORRECTION DE DEVOIR                 │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Description Textuelle du Flux

```
Enseignant        Frontend          GradeController        GradeService         SubmissionService        BDD
    │                 │                    │                     │                     │                   │
    │  Consulter      │                    │                     │                     │                   │
    │  soumissions    │                    │                     │                     │                   │
    │────────────────▶│                    │                     │                     │                   │
    │                 │  GET /submissions  │                     │                     │                   │
    │                 │  /assignment/{id}  │                     │                     │                   │
    │                 │───────────────────▶│                     │                     │                   │
    │                 │    Liste           │                     │                     │                   │
    │                 │◀───────────────────│                     │                     │                   │
    │  Soumissions    │                    │                     │                     │                   │
    │◀────────────────│                    │                     │                     │                   │
    │                 │                    │                     │                     │                   │
    │  Noter une      │                    │                     │                     │                   │
    │  soumission     │                    │                     │                     │                   │
    │────────────────▶│                    │                     │                     │                   │
    │                 │  POST /grades      │                     │                     │                   │
    │                 │  {submissionId,    │                     │                     │                   │
    │                 │   score, feedback} │                     │                     │                   │
    │                 │───────────────────▶│                     │                     │                   │
    │                 │                    │  gradeSubmission()  │                     │                   │
    │                 │                    │────────────────────▶│                     │                   │
    │                 │                    │                     │  getSubmission()    │                   │
    │                 │                    │                     │────────────────────▶│                   │
    │                 │                    │                     │    Submission       │                   │
    │                 │                    │                     │◀────────────────────│                   │
    │                 │                    │                     │  checkIfLate()      │                   │
    │                 │                    │                     │──────────┐          │                   │
    │                 │                    │                     │◀─────────┘          │                   │
    │                 │                    │                     │  applyPenalty()     │                   │
    │                 │                    │                     │──────────┐          │                   │
    │                 │                    │                     │◀─────────┘          │                   │
    │                 │                    │                     │  save(grade)        │                   │
    │                 │                    │                     │─────────────────────────────────────────▶│
    │                 │                    │                     │      OK             │                   │
    │                 │                    │                     │◀─────────────────────────────────────────│
    │                 │                    │        Grade        │                     │                   │
    │                 │                    │◀────────────────────│                     │                   │
    │                 │  201 Created       │                     │                     │                   │
    │                 │◀───────────────────│                     │                     │                   │
    │  Confirmation   │                    │                     │                     │                   │
    │◀────────────────│                    │                     │                     │                   │
    │                 │                    │                     │                     │                   │
```

---

# 7. Fonctionnalités Implémentées

## 7.1 Gestion des Utilisateurs et Authentification

### Inscription et Connexion

| Fonctionnalité | Description | Rôle(s) |
|----------------|-------------|---------|
| Inscription | Création de compte avec choix du rôle | Tous |
| Connexion JWT | Authentification sécurisée par token | Tous |
| Déconnexion | Invalidation de la session | Tous |
| Réinitialisation mot de passe | Envoi d'email avec lien de réinitialisation | Tous |
| Mise à jour profil | Modification des informations personnelles | Tous |

### Gestion des Comptes (Admin)

| Fonctionnalité | Description |
|----------------|-------------|
| Liste des utilisateurs | Affichage de tous les utilisateurs |
| Approbation enseignants | Validation des comptes enseignants en attente |
| Suspension de compte | Désactivation temporaire d'un compte |
| Réactivation de compte | Remise en service d'un compte suspendu |

## 7.2 Gestion des Cours

### Pour les Enseignants

| Fonctionnalité | Description |
|----------------|-------------|
| Création de cours | Ajout d'un nouveau cours avec description |
| Modification de cours | Mise à jour des informations du cours |
| Publication/Dépublication | Contrôle de la visibilité du cours |
| Suppression de cours | Retrait définitif d'un cours |
| Gestion des ressources | Upload de documents pédagogiques |
| Consultation des inscrits | Liste des étudiants inscrits au cours |

### Pour les Étudiants

| Fonctionnalité | Description |
|----------------|-------------|
| Recherche de cours | Recherche parmi les cours publiés |
| Inscription à un cours | Ajout d'un cours à son parcours |
| Désinscription | Retrait d'un cours |
| Téléchargement de ressources | Accès aux documents du cours |

## 7.3 Gestion des Devoirs et Soumissions

### Pour les Enseignants

| Fonctionnalité | Description |
|----------------|-------------|
| Création de devoir | Définition du devoir avec deadline et score max |
| Configuration des pénalités | Paramétrage de la pénalité de retard |
| Publication du devoir | Mise à disposition pour les étudiants |
| Consultation des soumissions | Vue de tous les travaux rendus |
| Téléchargement des fichiers | Récupération des travaux pour correction |
| Statistiques | Nombre total, corrigés, en retard, non notés |

### Pour les Étudiants

| Fonctionnalité | Description |
|----------------|-------------|
| Consultation des devoirs | Liste des devoirs à rendre |
| Soumission de travail | Upload du fichier de devoir |
| Multi-versioning | Possibilité de soumettre plusieurs versions |
| Suivi du statut | Visualisation de l'état de la soumission |

## 7.4 Système de Notation

### Pour les Enseignants

| Fonctionnalité | Description |
|----------------|-------------|
| Notation | Attribution d'une note sur le score max |
| Feedback | Ajout de commentaires et retours |
| Pénalité automatique | Application automatique des pénalités de retard |
| Modification de note | Mise à jour d'une note existante |
| Statistiques de notes | Moyennes par devoir, cours, étudiant |

### Pour les Étudiants

| Fonctionnalité | Description |
|----------------|-------------|
| Consultation des notes | Accès à toutes ses notes |
| Lecture du feedback | Visualisation des commentaires de l'enseignant |
| Historique | Suivi des notes par cours |

## 7.5 Administration

| Fonctionnalité | Description |
|----------------|-------------|
| Gestion des départements | CRUD des départements |
| Gestion des semestres | CRUD et activation des semestres |
| Gestion des matières | CRUD et association aux enseignants |
| Tableau de bord | Vue d'ensemble du système |

---

# 8. Base de Données

## 8.1 Modèle de Données

### Schéma Relationnel

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   user_role     │       │     roles       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──────▶│ user_id (FK)    │◀──────│ id (PK)         │
│ first_name      │       │ role_id (FK)    │       │ name            │
│ last_name       │       └─────────────────┘       └─────────────────┘
│ email (UNIQUE)  │
│ password        │
│ suspended       │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    courses      │       │course_enrollment│       │    subjects     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◀──────│ course_id (FK)  │       │ id (PK)         │
│ title           │       │ user_id (FK)    │──────▶│ name            │
│ description     │       │ enrolled_at     │       │ code            │
│ published       │       │ status          │       │ teacher_id (FK) │
│ teacher_id (FK) │       └─────────────────┘       │ department_id   │
│ subject_id (FK) │                                 └─────────────────┘
│ semester_id (FK)│
│ created_at      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────────────┐       ┌─────────────────┐
│course_materials │       │  assignments    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ title           │       │ title           │
│ description     │       │ description     │
│ file_url        │       │ deadline        │
│ file_type       │       │ max_score       │
│ file_size       │       │ late_penalty    │
│ download_count  │       │ published       │
│ course_id (FK)  │       │ course_id (FK)  │
│ uploaded_at     │       │ created_at      │
└─────────────────┘       └────────┬────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │  submissions    │       │     grades      │
                          ├─────────────────┤       ├─────────────────┤
                          │ id (PK)         │──────▶│ id (PK)         │
                          │ file_path       │       │ score           │
                          │ file_url        │       │ feedback        │
                          │ submitted_at    │       │ graded_at       │
                          │ version         │       │ late_penalty    │
                          │ is_late         │       │ submission_id   │
                          │ assignment_id   │       │ grader_id (FK)  │
                          │ student_id (FK) │       └─────────────────┘
                          └─────────────────┘
```

## 8.2 Description des Tables

### Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Identifiant unique (PK) |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| email | VARCHAR(255) | Email unique |
| password | VARCHAR(255) | Mot de passe hashé (BCrypt) |
| suspended | BOOLEAN | Compte suspendu |
| created_at | TIMESTAMP | Date de création |

### Table `courses`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Identifiant unique (PK) |
| title | VARCHAR(255) | Titre du cours |
| description | TEXT | Description détaillée |
| published | BOOLEAN | Cours publié |
| teacher_id | BIGINT | Enseignant (FK → users) |
| subject_id | BIGINT | Matière (FK → subjects) |
| semester_id | BIGINT | Semestre (FK → semesters) |
| created_at | TIMESTAMP | Date de création |

### Table `assignments`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Identifiant unique (PK) |
| title | VARCHAR(255) | Titre du devoir |
| description | TEXT | Consignes |
| deadline | TIMESTAMP | Date limite |
| max_score | DOUBLE | Score maximum |
| late_submission_penalty | DOUBLE | Pénalité de retard (%) |
| published | BOOLEAN | Devoir publié |
| course_id | BIGINT | Cours (FK → courses) |
| created_at | TIMESTAMP | Date de création |

### Table `submissions`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Identifiant unique (PK) |
| file_path | VARCHAR(255) | Chemin Cloudinary |
| file_url | VARCHAR(500) | URL de téléchargement |
| submitted_at | TIMESTAMP | Date de soumission |
| version | INTEGER | Numéro de version |
| is_late | BOOLEAN | Soumission en retard |
| assignment_id | BIGINT | Devoir (FK → assignments) |
| student_id | BIGINT | Étudiant (FK → users) |

### Table `grades`

| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGINT | Identifiant unique (PK) |
| score | DOUBLE | Note attribuée |
| feedback | TEXT | Commentaires |
| graded_at | TIMESTAMP | Date de notation |
| late_penalty_applied | DOUBLE | Pénalité appliquée |
| submission_id | BIGINT | Soumission (FK → submissions) |
| grader_id | BIGINT | Correcteur (FK → users) |

---

# 9. Sécurité

## 9.1 Authentification JWT

### Flux d'Authentification

```
┌──────────────────────────────────────────────────────────────────┐
│                    PROCESSUS D'AUTHENTIFICATION                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. L'utilisateur envoie ses identifiants (email + mot de passe) │
│                           │                                       │
│                           ▼                                       │
│  2. Le serveur vérifie les identifiants contre la BDD            │
│                           │                                       │
│                           ▼                                       │
│  3. Si valide : génération d'un token JWT signé                  │
│     - Header: {"alg": "HS256", "typ": "JWT"}                     │
│     - Payload: {sub, email, roles, exp, iat}                     │
│     - Signature: HMACSHA256(header + payload, secret)            │
│                           │                                       │
│                           ▼                                       │
│  4. Le token est renvoyé au client                               │
│                           │                                       │
│                           ▼                                       │
│  5. Le client stocke le token (LocalStorage)                     │
│                           │                                       │
│                           ▼                                       │
│  6. Toutes les requêtes incluent: Authorization: Bearer <token>  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Configuration JWT

| Paramètre | Valeur |
|-----------|--------|
| Algorithme | HS256 (HMAC-SHA256) |
| Durée de validité | 24 heures |
| Stockage côté client | LocalStorage |
| Header | Authorization: Bearer {token} |

## 9.2 Gestion des Rôles et Permissions

### Matrice des Permissions

| Endpoint | Admin | Teacher | Student |
|----------|-------|---------|---------|
| GET /users | ✅ | ❌ | ❌ |
| POST /users/suspend | ✅ | ❌ | ❌ |
| GET /courses | ✅ | ✅ | ✅ |
| POST /courses | ✅ | ✅ | ❌ |
| PUT /courses/{id} | ✅ | ✅* | ❌ |
| POST /assignments | ✅ | ✅ | ❌ |
| POST /submissions | ❌ | ❌ | ✅ |
| POST /grades | ✅ | ✅ | ❌ |
| GET /grades/my | ❌ | ❌ | ✅ |

*Seulement pour ses propres cours

### Annotations de Sécurité

```java
// Exemple d'annotation Spring Security
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> suspendUser(...) { ... }

@PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
public ResponseEntity<?> createCourse(...) { ... }
```

## 9.3 Mesures de Sécurité Additionnelles

| Mesure | Description |
|--------|-------------|
| **Hashage BCrypt** | Mots de passe hashés avec BCrypt (coût: 10) |
| **Validation des entrées** | Validation côté serveur de toutes les données |
| **CORS configuré** | Origines autorisées limitées |
| **Protection CSRF** | Désactivée car API stateless avec JWT |
| **Filtrage JWT** | Vérification du token à chaque requête |
| **Expiration des tokens** | Tokens JWT avec durée de vie limitée |

---

# 10. Maquettes UI/UX

## 10.1 Lien vers les Maquettes Figma

> **Accéder aux maquettes complètes du projet sur Figma :**

### [ESPACE POUR LIEN FIGMA]

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   🔗 LIEN FIGMA : _________________________________________________    │
│                                                                         │
│   Insérer ici le lien vers le projet Figma                             │
│                                                                         │
│   Exemple : https://www.figma.com/file/xxxxx/CampusMaster              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

## 10.2 Aperçu des Maquettes

### Maquettes Réalisées

| Écran | Description | Statut |
|-------|-------------|--------|
| Page d'accueil | Landing page du projet | ☐ |
| Connexion | Formulaire de connexion | ☐ |
| Inscription | Formulaire d'inscription | ☐ |
| Dashboard Admin | Tableau de bord administrateur | ☐ |
| Dashboard Enseignant | Tableau de bord enseignant | ☐ |
| Dashboard Étudiant | Tableau de bord étudiant | ☐ |
| Liste des cours | Catalogue des cours | ☐ |
| Détail d'un cours | Page de détail cours | ☐ |
| Gestion des devoirs | Interface devoirs | ☐ |
| Soumission de devoir | Formulaire de soumission | ☐ |
| Interface de notation | Correction et notation | ☐ |
| Consultation des notes | Affichage des notes étudiant | ☐ |

### [ESPACE POUR CAPTURES D'ÉCRAN DES MAQUETTES]

> **Insérer ici les captures d'écran des principales maquettes Figma**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                    CAPTURE MAQUETTE - PAGE D'ACCUEIL                    │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                    CAPTURE MAQUETTE - DASHBOARD                         │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                                                                         │
│                    CAPTURE MAQUETTE - GESTION COURS                     │
│                                                                         │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 10.3 Charte Graphique

### Couleurs Principales

| Couleur | Code Hex | Utilisation |
|---------|----------|-------------|
| Primaire | #______ | Boutons, liens, éléments actifs |
| Secondaire | #______ | Accents, éléments secondaires |
| Fond | #______ | Arrière-plan principal |
| Texte | #______ | Texte principal |
| Succès | #______ | Messages de succès |
| Erreur | #______ | Messages d'erreur |

### Typographie

| Type | Police | Utilisation |
|------|--------|-------------|
| Titres | _______ | H1, H2, H3 |
| Corps | _______ | Paragraphes, texte |
| Code | _______ | Blocs de code |

---

# 11. Interfaces Utilisateur

## 11.1 Pages d'Authentification

### Page de Connexion (`/auth/login`)
- Formulaire email/mot de passe
- Lien vers l'inscription
- Lien de récupération de mot de passe
- Redirection selon le rôle après connexion

### Page d'Inscription (`/auth/register`)
- Formulaire d'inscription complet
- Sélection du rôle (Étudiant/Enseignant)
- Validation des champs en temps réel

## 11.2 Interface Administrateur

### Tableau de Bord Admin (`/admin/dashboard`)
- Statistiques globales
- Accès rapide aux fonctionnalités

### Gestion des Utilisateurs (`/admin/users`)
- Liste paginée des utilisateurs
- Actions de suspension/réactivation
- Filtrage par rôle

### Approbation des Enseignants (`/admin/pending-teachers`)
- Liste des enseignants en attente
- Actions d'approbation/rejet

### Gestion des Départements (`/admin/departments`)
- CRUD complet
- Liste des départements

### Gestion des Semestres (`/admin/semesters`)
- CRUD complet
- Activation/désactivation

### Gestion des Matières (`/admin/subjects`)
- CRUD complet
- Association enseignant/département

## 11.3 Interface Enseignant

### Tableau de Bord Enseignant (`/teacher/dashboard`)
- Mes cours (publiés et brouillons)
- Devoirs en attente de correction
- Statistiques rapides

### Gestion des Cours (`/teacher/courses`)
- Liste de mes cours
- Création/modification de cours
- Publication/dépublication

### Détail d'un Cours (`/teacher/courses/[id]`)
- Informations du cours
- Gestion des ressources pédagogiques
- Liste des étudiants inscrits
- Liste des devoirs

### Gestion des Devoirs (`/teacher/assignments`)
- Liste des devoirs par cours
- Création de nouveaux devoirs
- Configuration des paramètres

### Correction (`/teacher/submissions`)
- Liste des soumissions à corriger
- Interface de notation
- Téléchargement des fichiers

## 11.4 Interface Étudiant

### Tableau de Bord Étudiant (`/user/dashboard`)
- Mes inscriptions
- Devoirs à venir
- Notes récentes

### Catalogue des Cours (`/user/courses`)
- Recherche de cours
- Inscription aux cours
- Accès à mes cours

### Détail d'un Cours (`/user/courses/[id]`)
- Description du cours
- Ressources téléchargeables
- Liste des devoirs

### Mes Devoirs (`/user/assignments`)
- Devoirs à rendre
- Historique des soumissions
- Interface de soumission

### Mes Notes (`/user/grades`)
- Liste des notes par cours
- Feedback des enseignants
- Moyennes

---

# 12. Conclusion et Perspectives

## 12.1 Bilan du Projet

### Objectifs Atteints

| Objectif | Statut | Commentaire |
|----------|--------|-------------|
| Système d'authentification sécurisé | ✅ | JWT avec gestion des rôles |
| Gestion complète des cours | ✅ | CRUD + publication |
| Système de devoirs et soumissions | ✅ | Multi-versions, gestion des retards |
| Notation avec feedback | ✅ | Pénalités automatiques |
| Stockage cloud des fichiers | ✅ | Cloudinary intégré |
| Interface utilisateur moderne | ✅ | Next.js + Tailwind CSS |
| API REST complète | ✅ | Spring Boot 3.2 |

### Points Forts

- **Architecture moderne** : Séparation claire frontend/backend
- **Sécurité robuste** : JWT, BCrypt, RBAC
- **Expérience utilisateur** : Interface intuitive et responsive
- **Scalabilité** : Architecture prête pour le passage à l'échelle
- **Code maintenable** : TypeScript, bonnes pratiques Java

### Difficultés Rencontrées

| Difficulté | Solution Apportée |
|------------|-------------------|
| Gestion des fichiers volumineux | Utilisation de Cloudinary |
| Authentification multi-rôles | Implémentation JWT avec claims personnalisés |
| Gestion des retards | Calcul automatique avec pénalités configurables |
| CORS en développement | Configuration détaillée Spring Security |

## 12.2 Perspectives d'Amélioration

### Court Terme

- [ ] Notifications en temps réel (WebSocket)
- [ ] Système de messagerie interne
- [ ] Export des notes en PDF/Excel
- [ ] Mode hors ligne (PWA)

### Moyen Terme

- [ ] Intégration d'un système de quiz/QCM
- [ ] Forum de discussion par cours
- [ ] Détection de plagiat
- [ ] Analytics avancés pour les enseignants

### Long Terme

- [ ] Application mobile native
- [ ] Intelligence artificielle pour recommandations
- [ ] Intégration calendrier externe
- [ ] API publique pour intégrations tierces

## 12.3 Compétences Acquises

| Domaine | Compétences |
|---------|-------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | Spring Boot, Spring Security, JPA/Hibernate |
| **Base de données** | PostgreSQL, modélisation relationnelle |
| **DevOps** | Docker, déploiement cloud |
| **Sécurité** | JWT, RBAC, bonnes pratiques |
| **Architecture** | REST API, architecture en couches |

---

# Annexes

## A. Endpoints API

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/register` | Inscription |
| POST | `/api/authenticate` | Connexion |
| POST | `/api/forgot-password` | Demande de réinitialisation |
| POST | `/api/reset-password` | Réinitialisation du mot de passe |

### Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Liste des utilisateurs |
| GET | `/api/users/{id}` | Détail d'un utilisateur |
| PUT | `/api/users/{id}` | Mise à jour profil |
| POST | `/api/users/{id}/suspend` | Suspendre un compte |
| POST | `/api/users/{id}/unsuspend` | Réactiver un compte |
| GET | `/api/users/pending-teachers` | Enseignants en attente |
| POST | `/api/users/approve-teacher/{id}` | Approuver un enseignant |

### Cours

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/courses` | Liste des cours |
| GET | `/api/courses/{id}` | Détail d'un cours |
| POST | `/api/courses` | Créer un cours |
| PUT | `/api/courses/{id}` | Modifier un cours |
| DELETE | `/api/courses/{id}` | Supprimer un cours |
| POST | `/api/courses/{id}/publish` | Publier |
| POST | `/api/courses/{id}/unpublish` | Dépublier |
| POST | `/api/courses/{id}/enroll` | S'inscrire |
| DELETE | `/api/courses/{id}/unenroll` | Se désinscrire |

### Devoirs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/assignments` | Liste des devoirs |
| GET | `/api/assignments/{id}` | Détail d'un devoir |
| POST | `/api/assignments` | Créer un devoir |
| PUT | `/api/assignments/{id}` | Modifier un devoir |
| DELETE | `/api/assignments/{id}` | Supprimer un devoir |

### Soumissions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/submissions` | Soumettre un travail |
| GET | `/api/submissions/assignment/{id}` | Soumissions d'un devoir |
| GET | `/api/submissions/{id}/download` | Télécharger le fichier |

### Notes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/grades` | Noter une soumission |
| GET | `/api/grades/my` | Mes notes (étudiant) |
| GET | `/api/grades/course/{id}` | Notes d'un cours |

## B. Variables d'Environnement

```properties
# Base de données
spring.datasource.url=jdbc:postgresql://host:port/database
spring.datasource.username=username
spring.datasource.password=password

# JWT
jwt.secret=your-secret-key

# Cloudinary
cloudinary.cloud_name=your-cloud-name
cloudinary.api_key=your-api-key
cloudinary.api_secret=your-api-secret

# Email
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email
spring.mail.password=your-app-password
```

## C. Instructions de Déploiement

### Prérequis

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+

### Backend

```bash
cd Backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd Frontend
npm install
npm run build
npm start
```

### Docker

```bash
docker-compose up -d
```

---

**Document réalisé dans le cadre du projet CampusMaster - Master 2**

*Année universitaire 2024-2025*
