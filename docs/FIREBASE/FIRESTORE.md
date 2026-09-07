# 🗄️ Cloud Firestore Architecture & Operations

## 1. Firestore as Primary Database
Cloud Firestore acts as the **single source of truth** for all application state.
- **ACID Transactions**: Supported across documents.
- **Sharded Architecture**: Automatic scaling to millions of documents.
- **Offline Mode**: Enabled via Firebase Emulators for seamless local development.

---

## 2. Access Pattern Guidelines
1. **Document Size**: Keep documents well below the 1MB Firestore limit. Large resumes and files are stored in **Firebase Storage**, with only URLs and text metrics stored in Firestore.
2. **Deterministic Document IDs**: User-centric 1-to-1 documents use the `userId` as the document ID (e.g., `profiles/{userId}`).
3. **Compound Queries**: Multi-attribute queries (e.g., `where('userId', '==', uid).order_by('completedAt', direction='DESCENDING')`) are backed by explicit composite indexes.

---

## 3. Repository Abstraction Layer
Located in `backend/app/firebase/firestore.py`:
- `FirestoreRepository`: Type-safe encapsulation of `get()`, `set()`, `create()`, `update()`, `delete()`, and `query_by_user()`.
- Prevents raw Firestore SDK calls from leaking into HTTP controllers.
