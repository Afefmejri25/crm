# 📘 Contexte de l'application CRM Centre d'Appels

## 🎯 Objectif
Gérer les relations client dans un environnement de centre d'appels avec deux types d'utilisateurs :
- **Agent**
- **Administrateur**

---

## 🧑‍💼 Agent
- Peut voir, créer, modifier **ses propres** clients
- Peut enregistrer des appels/actions pour analyse
- Peut consulter les documents et notifications
- Ne peut **pas** supprimer de client

## 👑 Administrateur
- Peut créer/modifier les agents
- Peut supprimer n’importe quel client
- Peut envoyer des notifications
- Dispose d’un tableau de bord analytique complet

---

## 🔐 Authentification
- Les utilisateurs se connectent via email/mot de passe
- Un rôle leur est assigné : "agent" ou "admin"
- L’interface est affichée selon le rôle

---

## 🌍 Multilingue
- Interface disponible en **Français** et **Allemand**
- Le choix de langue est sauvegardé par utilisateur