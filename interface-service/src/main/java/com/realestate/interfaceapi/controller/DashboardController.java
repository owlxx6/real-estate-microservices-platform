package com.realestate.interfaceapi.controller;

import com.realestate.interfaceapi.dto.AgentDashboardDTO;
import com.realestate.interfaceapi.dto.ClientDashboardDTO;
import com.realestate.interfaceapi.dto.DashboardStatisticsDTO;
import com.realestate.interfaceapi.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated dashboard APIs")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/statistics")
    @Operation(summary = "Get overall platform statistics aggregated from all services")
    public ResponseEntity<DashboardStatisticsDTO> getDashboardStatistics() {
        DashboardStatisticsDTO statistics = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    @GetMapping("/agent/{id}")
    @Operation(summary = "Get agent dashboard with properties and visits")
    public ResponseEntity<AgentDashboardDTO> getAgentDashboard(@PathVariable Long id) {
        AgentDashboardDTO dashboard = dashboardService.getAgentDashboard(id);
        return ResponseEntity.ok(dashboard);
    }
    
    @GetMapping("/client/{id}")
    @Operation(summary = "Get client dashboard with visits and properties")
    public ResponseEntity<ClientDashboardDTO> getClientDashboard(@PathVariable Long id) {
        ClientDashboardDTO dashboard = dashboardService.getClientDashboard(id);
        return ResponseEntity.ok(dashboard);
    }
}

