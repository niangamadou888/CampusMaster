package com.campusmaster.Controller;

import com.campusmaster.DAO.UserDAO;
import com.campusmaster.Entity.JwtRequest;
import com.campusmaster.Entity.JwtResponse;
import com.campusmaster.Entity.User;
import com.campusmaster.Service.EmailService;
import com.campusmaster.Service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin
public class JwtController {
    @Lazy
    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Lazy
    @Autowired
    private EmailService emailService;

    @Autowired
    private UserDAO userDao;

    @PostMapping({"/authenticate"})
    public JwtResponse createJwtToken(@RequestBody JwtRequest jwtRequest) throws Exception {
        return jwtService.createJwtToken(jwtRequest);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String userEmail = request.get("userEmail");
        User user = userDao.findByUserEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));

        // Générer un token unique
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        userDao.save(user);

        // Envoyer l'email avec un lien contenant le token
        String resetLink = "http://localhost:4200/modify-password?token=" + resetToken;
        emailService.sendEmail(user.getUserEmail(), "Réinitialisation de votre mot de passe",
                "Cliquez sur ce lien pour réinitialiser votre mot de passe : " + resetLink);

        return ResponseEntity.ok("Email de réinitialisation envoyé.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam("token") String token,
            @RequestBody Map<String, String> request) {

        String newPassword = request.get("newPassword");

        List<User> users = userDao.findByResetToken(token);
        if (users.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token invalide.");
        } else if (users.size() > 1) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Problème de sécurité : Token en double.");
        }

        User user = users.get(0);

        // Hacher le mot de passe avant de l'enregistrer
        user.setUserPassword(getEncodedPassword(newPassword));
        user.setResetToken(null); // Supprimer le token après utilisation
        userDao.save(user);

        return ResponseEntity.ok("Mot de passe réinitialisé avec succès.");
    }
    public String getEncodedPassword(String password) {
        return passwordEncoder.encode(password);
    }
}