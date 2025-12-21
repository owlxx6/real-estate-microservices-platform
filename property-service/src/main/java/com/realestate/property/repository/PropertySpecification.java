package com.realestate.property.repository;

import com.realestate.property.model.Property;
import com.realestate.property.model.PropertyStatus;
import com.realestate.property.model.PropertyType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PropertySpecification {
    
    public static Specification<Property> filterProperties(
            String city,
            PropertyType type,
            PropertyStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minRooms,
            Integer maxRooms,
            Integer minSurface,
            Integer maxSurface) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (city != null && !city.isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("city")), 
                    "%" + city.toLowerCase() + "%"
                ));
            }
            
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            
            if (minRooms != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("rooms"), minRooms));
            }
            
            if (maxRooms != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("rooms"), maxRooms));
            }
            
            if (minSurface != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("surface"), minSurface));
            }
            
            if (maxSurface != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("surface"), maxSurface));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}

