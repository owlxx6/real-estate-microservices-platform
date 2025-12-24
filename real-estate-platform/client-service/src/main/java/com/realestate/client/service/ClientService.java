package com.realestate.client.service;

import com.realestate.client.model.Client;
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
    
    public Page<Client> getAllClients(Pageable pageable) {
        return clientRepository.findAll(pageable);
    }
    
    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + id));
    }
    
    public Client createClient(Client client) {
        Client saved = clientRepository.save(client);
        log.info("Client created with id: {}", saved.getId());
        return saved;
    }
    
    public Client updateClient(Long id, Client clientDetails) {
        Client client = getClientById(id);
        client.setFirstName(clientDetails.getFirstName());
        client.setLastName(clientDetails.getLastName());
        client.setEmail(clientDetails.getEmail());
        client.setPhone(clientDetails.getPhone());
        client.setType(clientDetails.getType());
        client.setNotes(clientDetails.getNotes());
        return clientRepository.save(client);
    }
    
    public void deleteClient(Long id) {
        clientRepository.deleteById(id);
        log.info("Client deleted with id: {}", id);
    }
}
