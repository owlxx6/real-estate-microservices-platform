package com.realestate.interfaceapi.feign;

import com.realestate.interfaceapi.dto.AgentDTO;
import com.realestate.interfaceapi.dto.ClientDTO;
import com.realestate.interfaceapi.dto.VisitDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "client-service")
public interface ClientServiceClient {
    
    @GetMapping("/api/clients/{id}")
    ClientDTO getClientById(@PathVariable("id") Long id);
    
    @GetMapping("/api/clients")
    Object getAllClients();
    
    @GetMapping("/api/agents/{id}")
    AgentDTO getAgentById(@PathVariable("id") Long id);
    
    @GetMapping("/api/agents")
    Object getAllAgents();
    
    @GetMapping("/api/visits/{id}")
    VisitDTO getVisitById(@PathVariable("id") Long id);
    
    @GetMapping("/api/visits/client/{clientId}")
    List<VisitDTO> getVisitsByClient(@PathVariable("clientId") Long clientId);
    
    @GetMapping("/api/visits/property/{propertyId}")
    List<VisitDTO> getVisitsByProperty(@PathVariable("propertyId") Long propertyId);
    
    @GetMapping("/api/visits/recent")
    List<VisitDTO> getRecentVisits();
    
    @PostMapping("/api/visits")
    VisitDTO createVisit(@RequestBody VisitDTO visit);
}

