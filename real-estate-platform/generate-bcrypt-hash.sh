#!/bin/bash

# Script pour générer un hash BCrypt valide pour "password123"
# Utilise un script Java temporaire

cat > /tmp/GenerateHash.java << 'EOF'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        
        // Vérifier
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + matches);
        
        // Tester avec le hash existant
        String existingHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        boolean existingMatches = encoder.matches(password, existingHash);
        System.out.println("Existing hash matches: " + existingMatches);
    }
}
EOF

echo "Pour générer un hash, exécutez ce code Java dans client-service:"
echo ""
echo "BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();"
echo "String hash = encoder.encode(\"password123\");"
echo "System.out.println(hash);"

