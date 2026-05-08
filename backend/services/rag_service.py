import json
import os
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.challenges_data = []
        self.collection = None
        self.model = None
        self._load_challenges_data()
        self._init_vector_store()

    def _load_challenges_data(self):
        challenges_file = os.getenv("CHALLENGES_FILE", "./data/challenges.json")
        try:
            with open(challenges_file, "r", encoding="utf-8") as f:
                self.challenges_data = json.load(f)
            logger.info(f"Loaded {len(self.challenges_data)} challenges from {challenges_file}")
        except FileNotFoundError:
            logger.error(f"Challenges file not found: {challenges_file}")
            self.challenges_data = []

    def _init_vector_store(self):
        try:
            from sentence_transformers import SentenceTransformer
            import chromadb

            chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
            os.makedirs(chroma_path, exist_ok=True)

            logger.info("Loading sentence transformer model...")
            self.model = SentenceTransformer("all-MiniLM-L6-v2")

            client = chromadb.PersistentClient(path=chroma_path)
            self.collection = client.get_or_create_collection(
                name="challenges",
                metadata={"hnsw:space": "cosine"},
            )

            if self.collection.count() == 0:
                self._index_challenges()
            else:
                logger.info(f"Loaded existing vector store with {self.collection.count()} entries")

        except ImportError as e:
            logger.warning(f"Vector store dependencies not available: {e}. Using keyword search fallback.")
            self.model = None
            self.collection = None
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}. Using keyword search fallback.")
            self.model = None
            self.collection = None

    def _index_challenges(self):
        if not self.challenges_data or not self.model:
            return

        logger.info("Indexing challenges into vector store...")
        documents, embeddings, metadatas, ids = [], [], [], []

        for c in self.challenges_data:
            text = f"{c['title']} {c['description']} {' '.join(c['tags'])} {c['category']} {c['difficulty']}"
            emb = self.model.encode(text).tolist()

            documents.append(text)
            embeddings.append(emb)
            metadatas.append({
                "id": c["id"],
                "category": c["category"],
                "difficulty": c["difficulty"],
                "xp_reward": c["xp_reward"],
                "min_level": c["min_level"],
                "max_level": c.get("max_level") or 999,
                "title": c["title"],
                "description": c["description"],
                "tags": ",".join(c["tags"]),
            })
            ids.append(c["id"])

        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )
        logger.info(f"Indexed {len(ids)} challenges into ChromaDB")

    def retrieve_challenges(
        self,
        query: str,
        user_level: int,
        category: Optional[str] = None,
        n: int = 3,
    ) -> List[dict]:
        if self.model and self.collection:
            return self._semantic_search(query, user_level, category, n)
        return self._keyword_search(query, user_level, category, n)

    def _semantic_search(self, query: str, user_level: int, category: Optional[str], n: int) -> List[dict]:
        try:
            query_embedding = self.model.encode(query).tolist()

            # ChromaDB requires $and when combining multiple filter fields
            if category:
                where_conditions = {
                    "$and": [
                        {"min_level": {"$lte": user_level}},
                        {"category": {"$eq": category}},
                    ]
                }
            else:
                where_conditions = {"min_level": {"$lte": user_level}}

            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(n, self.collection.count()),
                where=where_conditions,
            )

            challenges = []
            for metadata in results["metadatas"][0]:
                challenge = self._find_full_challenge(metadata["id"])
                if challenge:
                    challenges.append(challenge)
            return challenges

        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return self._keyword_search(query, user_level, category, n)

    def _keyword_search(self, query: str, user_level: int, category: Optional[str], n: int) -> List[dict]:
        query_lower = query.lower()
        query_words = set(query_lower.split())

        scored = []
        for c in self.challenges_data:
            if c["min_level"] > user_level:
                continue
            if category and c["category"] != category:
                continue

            score = 0
            text = f"{c['title']} {c['description']} {' '.join(c['tags'])} {c['category']}".lower()
            for word in query_words:
                if word in text:
                    score += 1
            scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:n]]

    def _find_full_challenge(self, challenge_id: str) -> Optional[dict]:
        for c in self.challenges_data:
            if c["id"] == challenge_id:
                return c
        return None

    def get_challenge_by_id(self, challenge_id: str) -> Optional[dict]:
        return self._find_full_challenge(challenge_id)

    def get_all_challenges(self, user_level: int, category: Optional[str] = None) -> List[dict]:
        results = []
        for c in self.challenges_data:
            if c["min_level"] > user_level:
                continue
            if category and c["category"] != category:
                continue
            results.append(c)
        return results
