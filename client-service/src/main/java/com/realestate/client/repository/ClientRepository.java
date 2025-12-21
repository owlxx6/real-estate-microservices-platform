package com.realestate.client.repository;

import com.realestate.client.model.Client;
import com.realestate.client.model.ClientType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    
    Optional<Client> findByEmail(String email);
    
    Page<Client> findByType(ClientType type, Pageable pageable);
    
    boolean existsByEmail(String email);
}

