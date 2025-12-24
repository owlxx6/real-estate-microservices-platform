package com.realestate.interfaceapi.feign;

import java.util.List;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.realestate.interfaceapi.dto.AuthRequestDTO;
import com.realestate.interfaceapi.dto.UserDTO;

@FeignClient(name = "client-service", url = "http://localhost:8082")
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
    
    // Authentication endpoints
    @PostMapping("/api/users/authenticate")
    UserDTO authenticate(@RequestBody AuthRequestDTO request);
}
