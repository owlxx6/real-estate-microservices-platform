package com.realestate.client.service;

import com.realestate.client.model.Client;
import com.realestate.client.model.ClientType;
import com.realestate.client.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClientService {
    
    private final ClientRepository clientRepository;
    
    public Client createClient(Client client) {
        log.info("Creating new client: {} {}", client.getFirstName(), client.getLastName());
        
        if (clientRepository.existsByEmail(client.getEmail())) {
            throw new RuntimeException("Client with email " + client.getEmail() + " already exists");
        }
        
        return clientRepository.save(client);
    }
    
    public Client getClientById(Long id) {
        log.info("Fetching client with id: {}", id);
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
    }
    
    public Page<Client> getAllClients(Pageable pageable) {
        log.info("Fetching all clients with pagination");
        return clientRepository.findAll(pageable);
    }
    
    public Client updateClient(Long id, Client clientDetails) {
        log.info("Updating client with id: {}", id);
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
        
        client.setFirstName(clientDetails.getFirstName());
        client.setLastName(clientDetails.getLastName());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setType(clientDetails.getType());
        
        return clientRepository.save(client);
    }
    
    public void deleteClient(Long id) {
        log.info("Deleting client with id: {}", id);
        if (!clientRepository.existsById(id)) {
            throw new RuntimeException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }
    
    public Page<Client> getClientsByType(ClientType type, Pageable pageable) {
        log.info("Fetching clients by type: {}", type);
        return clientRepository.findByType(type, pageable);
    }
}

