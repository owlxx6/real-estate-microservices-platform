package com.realestate.client.service;

import com.realestate.client.feign.PropertyServiceClient;
import com.realestate.client.model.Agent;
import com.realestate.client.repository.AgentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgentService {
    private final AgentRepository agentRepository;
    private final PropertyServiceClient propertyServiceClient;
    
    public Page<Agent> getAllAgents(Pageable pageable) {
        return agentRepository.findAll(pageable);
    }
    
    public Agent getAgentById(Long id) {
        return agentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agent not found with id: " + id));
    }
    
    public Agent createAgent(Agent agent) {
        Agent saved = agentRepository.save(agent);
        log.info("Agent created with id: {}", saved.getId());
        return saved;
    }
    
    public Agent updateAgent(Long id, Agent agentDetails) {
        Agent agent = getAgentById(id);
        agent.setFirstName(agentDetails.getFirstName());
        agent.setLastName(agentDetails.getLastName());
        agent.setEmail(agentDetails.getEmail());
        agent.setPhone(agentDetails.getPhone());
        agent.setSpecialization(agentDetails.getSpecialization());
        agent.setLicenseNumber(agentDetails.getLicenseNumber());
        agent.setYearsExperience(agentDetails.getYearsExperience());
        agent.setRating(agentDetails.getRating());
        return agentRepository.save(agent);
    }
    
    public void deleteAgent(Long id) {
        agentRepository.deleteById(id);
        log.info("Agent deleted with id: {}", id);
    }
    
    public Map<String, Object> getAgentPortfolio(Long agentId) {
        log.info("Fetching portfolio for agent: {} via OpenFeign", agentId);
        return propertyServiceClient.getPropertiesByAgent(agentId);
    }
}
