package com.realestate.client.repository;

import com.realestate.client.model.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
    
    Optional<Agent> findByEmail(String email);
    
    boolean existsByEmail(String email);
}

