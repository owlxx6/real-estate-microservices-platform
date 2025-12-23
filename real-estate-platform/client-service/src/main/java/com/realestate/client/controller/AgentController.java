package com.realestate.client.controller;

import com.realestate.client.model.Agent;
import com.realestate.client.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Tag(name = "Agents", description = "Agent management APIs")
public class AgentController {
    private final AgentService agentService;
    
    @GetMapping
    @Operation(summary = "Get all agents")
    public ResponseEntity<Page<Agent>> getAllAgents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(agentService.getAllAgents(PageRequest.of(page, size)));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get agent by ID")
    public ResponseEntity<Agent> getAgentById(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create a new agent")
    public ResponseEntity<Agent> createAgent(@Valid @RequestBody Agent agent) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agentService.createAgent(agent));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an agent")
    public ResponseEntity<Agent> updateAgent(@PathVariable Long id, @Valid @RequestBody Agent agent) {
        return ResponseEntity.ok(agentService.updateAgent(id, agent));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an agent")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/properties")
    @Operation(summary = "Get agent portfolio via OpenFeign")
    public ResponseEntity<Map<String, Object>> getAgentPortfolio(@PathVariable Long id) {
        return ResponseEntity.ok(agentService.getAgentPortfolio(id));
    }
}
