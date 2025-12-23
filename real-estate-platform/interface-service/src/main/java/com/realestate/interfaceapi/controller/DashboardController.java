package com.realestate.interfaceapi.controller;

import com.realestate.interfaceapi.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated dashboard APIs")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    @GetMapping("/statistics")
    @Operation(summary = "Get overall platform statistics aggregated from all services")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        Map<String, Object> statistics = dashboardService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }
}
