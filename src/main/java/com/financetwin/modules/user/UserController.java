package com.financetwin.modules.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financetwin.modules.user.dto.CreateUserCommand;
import com.financetwin.modules.user.dto.UserView;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserView> createUser(@Valid @RequestBody CreateUserCommand command) {
        UserView userView = userService.createUser(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(userView);
    }

    @GetMapping
    public ResponseEntity<List<UserView>> listUsers() {
        List<UserView> users = userService.listUsers();
        return ResponseEntity.ok(users);
    }
}
