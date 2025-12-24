package com.realestate.client.service;

import com.realestate.client.model.User;
import com.realestate.client.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsernameAndIsActiveTrue(username);
    }
    
    public boolean validatePassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
    
    @Transactional
    public User createUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    @Transactional
    public User registerClient(com.realestate.client.dto.RegisterRequestDTO registerRequest, ClientService clientService) {
        // Vérifier si le username existe déjà
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        // Créer le Client d'abord
        com.realestate.client.model.Client client = new com.realestate.client.model.Client();
        client.setFirstName(registerRequest.getFirstName());
        client.setLastName(registerRequest.getLastName());
        client.setEmail(registerRequest.getEmail());
        client.setPhone(registerRequest.getPhone() != null && !registerRequest.getPhone().isEmpty() 
            ? registerRequest.getPhone() 
            : "0000000000");
        client.setType(com.realestate.client.model.Client.ClientType.BUYER);
        
        com.realestate.client.model.Client savedClient = clientService.createClient(client);
        
        // Créer l'utilisateur avec le rôle CLIENT
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(User.Role.CLIENT);
        user.setClientId(savedClient.getId());
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userDetails.getEmail());
        }
        
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        
        if (userDetails.getIsActive() != null) {
            user.setIsActive(userDetails.getIsActive());
        }
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> authenticate(String username, String password) {
        log.info("Authentication attempt for username: {}", username);
        Optional<User> userOpt = findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            log.info("User found: {} with role: {}", user.getUsername(), user.getRole());
            boolean passwordMatches = validatePassword(user, password);
            log.info("Password validation result: {}", passwordMatches);
            if (passwordMatches) {
                log.info("Authentication successful for user: {}", username);
                return Optional.of(user);
            } else {
                log.warn("Password mismatch for user: {}", username);
            }
        } else {
            log.warn("User not found: {}", username);
        }
        return Optional.empty();
    }
}

