package com.realestate.interfaceapi.controller;

import com.realestate.interfaceapi.service.DashboardService;
import com.realestate.interfaceapi.util.RoleChecker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated dashboard APIs")
@Slf4j
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final RoleChecker roleChecker;
    
    @GetMapping("/statistics")
    @Operation(summary = "Get overall platform statistics aggregated from all services - AGENT/ADMIN only")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics(HttpServletRequest request) {
        log.info("Dashboard statistics requested");
        
        // Check that user is AGENT or ADMIN
        // ADMIN must have access to all dashboard statistics
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        
        log.info("Access granted for dashboard statistics");
        Map<String, Object> statistics = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }
}
