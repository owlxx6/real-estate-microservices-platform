package com.realestate.client.service;

import com.realestate.client.dto.AgentPortfolioDTO;
import com.realestate.client.dto.PropertyDTO;
import com.realestate.client.feign.PropertyServiceClient;
import com.realestate.client.model.Agent;
import com.realestate.client.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgentService {
    
    private final AgentRepository agentRepository;
    private final PropertyServiceClient propertyServiceClient;
    
    public Agent createAgent(Agent agent) {
        log.info("Creating new agent: {} {}", agent.getFirstName(), agent.getLastName());
        
        if (agentRepository.existsByEmail(agent.getEmail())) {
            throw new RuntimeException("Agent with email " + agent.getEmail() + " already exists");
        }
        
        return agentRepository.save(agent);
    }
    
    public Agent getAgentById(Long id) {
        log.info("Fetching agent with id: {}", id);
        return agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with id: " + id));
    }
    
    public Page<Agent> getAllAgents(Pageable pageable) {
        log.info("Fetching all agents with pagination");
        return agentRepository.findAll(pageable);
    }
    
    public Agent updateAgent(Long id, Agent agentDetails) {
        log.info("Updating agent with id: {}", id);
        Agent agent = agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with id: " + id));
        
        agent.setFirstName(agentDetails.getFirstName());
        agent.setLastName(agentDetails.getLastName());
        agent.setEmail(agentDetails.getEmail());
        agent.setPhone(agentDetails.getPhone());
        agent.setSpecialization(agentDetails.getSpecialization());
        
        return agentRepository.save(agent);
    }
    
    public void deleteAgent(Long id) {
        log.info("Deleting agent with id: {}", id);
        if (!agentRepository.existsById(id)) {
            throw new RuntimeException("Agent not found with id: " + id);
        }
        agentRepository.deleteById(id);
    }
    
    /**
     * Get agent portfolio using OpenFeign to call Property Service
     */
    public AgentPortfolioDTO getAgentPortfolio(Long agentId) {
        log.info("Fetching portfolio for agent: {}", agentId);
        
        Agent agent = getAgentById(agentId);
        
        // Call Property Service via OpenFeign
        List<PropertyDTO> properties = propertyServiceClient.getPropertiesByAgent(agentId);
        
        AgentPortfolioDTO portfolio = new AgentPortfolioDTO();
        portfolio.setAgent(agent);
        portfolio.setProperties(properties);
        portfolio.setPropertyCount(properties.size());
        
        log.info("Agent {} has {} properties", agentId, properties.size());
        
        return portfolio;
    }
}

