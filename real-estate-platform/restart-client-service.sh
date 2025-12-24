#!/bin/bash

echo "🔄 Redémarrage de client-service..."

# Trouver le PID
PID=$(ps aux | grep "ClientServiceApplication" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "❌ client-service n'est pas en cours d'exécution"
    echo "💡 Démarrez-le avec: cd client-service && mvn spring-boot:run &"
    exit 1
fi

echo "📌 PID trouvé: $PID"
echo "🛑 Arrêt de client-service..."

# Kill le processus
kill $PID

# Attendre que le processus se termine
sleep 3

# Vérifier qu'il est bien arrêté
if ps -p $PID > /dev/null 2>&1; then
    echo "⚠️  Le processus ne s'est pas arrêté, force kill..."
    kill -9 $PID
    sleep 2
fi

echo "✅ client-service arrêté"
echo "🚀 Démarrage de client-service..."

# Redémarrer
cd client-service
nohup mvn spring-boot:run > ../logs/client-service.log 2>&1 &
NEW_PID=$!

echo "✅ client-service démarré avec PID: $NEW_PID"
echo "⏳ Attente du démarrage (15 secondes)..."
sleep 15

# Vérifier qu'il répond
echo "🔍 Vérification..."
if curl -s http://localhost:8082/actuator/health > /dev/null 2>&1; then
    echo "✅ client-service est opérationnel!"
    echo "🧪 Test de l'endpoint /api/users/username/admin..."
    curl -s http://localhost:8082/api/users/username/admin | head -c 200
    echo ""
else
    echo "⚠️  client-service ne répond pas encore, attendez quelques secondes de plus"
fi

cd ..

