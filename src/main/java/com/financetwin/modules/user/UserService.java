package com.financetwin.modules.user;

import java.util.List;

import com.financetwin.modules.user.dto.CreateUserCommand;
import com.financetwin.modules.user.dto.UserView;

import jakarta.validation.Valid;

public interface UserService {

    UserView createUser(@Valid CreateUserCommand command);

    List<UserView> listUsers();
}
