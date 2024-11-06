import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [message, setMessage] = useState("");
    const [posts, setPosts] = useState([]);
    const [totalPosts, setTotalPosts] = useState(0);

    useEffect(() => {
        // Initialiser la connexion au contrat
        const initProvider = async () => {
            if (typeof window.ethereum !== "undefined") {
                try {
                    await window.ethereum.request({ method: "eth_requestAccounts" });
                    const _provider = new ethers.providers.Web3Provider(window.ethereum);
                    const _signer = _provider.getSigner();
                    const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
                    setProvider(_provider);
                    setSigner(_signer);
                    setContract(_contract);
                } catch (error) {
                    console.error("Erreur lors de la connexion MetaMask :", error);
                }
            } else {
                console.error("MetaMask n'est pas installé.");
                alert("Veuillez installer MetaMask pour utiliser cette application.");
            }
        };

        initProvider();
    }, []);

    // Fonction pour publier un message
    const publishPost = async () => {
        if (message.trim() === "" || !contract) return;
        console.log("Tentative de publication :", message);
        try {
            const tx = await contract.publishPost(message);
            console.log("Transaction envoyée :", tx);
            await tx.wait();
            console.log("Transaction confirmée");
            setMessage("");
            fetchPosts();
        } catch (error) {
            console.error("Erreur lors de la publication :", error);
        }
    };

    // Fonction pour récupérer le nombre total de messages
    const fetchPosts = async () => {
        if (!contract) return;
        try {
            const total = await contract.getTotalPosts();
            setTotalPosts(total.toNumber());
            const _posts = [];
            for (let i = 0; i < total; i++) {
                const [msg, author] = await contract.getPost(i);
                _posts.push({ message: msg, author });
            }
            setPosts(_posts);
        } catch (error) {
            console.error("Erreur lors de la récupération des messages :", error);
        }
    };

    // Récupération des posts au chargement
    useEffect(() => {
        fetchPosts();
    }, [contract]);

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Mini Réseau Social</h1>
            <input
                type="text"
                placeholder="Votre message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
            />
            <button onClick={publishPost} style={{ padding: "0.5rem 1rem" }}>Publier</button>

            <h2>Messages publiés ({totalPosts})</h2>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {posts.map((post, index) => (
                    <li key={index} style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
                        <p><strong>Message :</strong> {post.message}</p>
                        <p><strong>Auteur :</strong> {post.author}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
