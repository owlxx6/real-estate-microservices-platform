package com.realestate.interfaceapi.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "client-service")
public interface ClientServiceClient {
    
    @GetMapping("/api/clients/{id}")
    Map<String, Object> getClientById(@PathVariable Long id);
    
    @GetMapping("/api/clients")
    Map<String, Object> getAllClients();
    
    @GetMapping("/api/agents/{id}")
    Map<String, Object> getAgentById(@PathVariable Long id);
    
    @GetMapping("/api/agents")
    Map<String, Object> getAllAgents();
    
    @GetMapping("/api/visits/recent")
    List<Map<String, Object>> getRecentVisits();
    
    @GetMapping("/api/visits/client/{clientId}")
    List<Map<String, Object>> getVisitsByClient(@PathVariable Long clientId);
}
