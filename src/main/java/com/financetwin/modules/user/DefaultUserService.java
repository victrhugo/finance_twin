package com.financetwin.modules.user;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import com.financetwin.modules.user.dto.CreateUserCommand;
import com.financetwin.modules.user.dto.UserView;

@Service
@Validated
class DefaultUserService implements UserService {

    private final UserRepository userRepository;
    private final DefaultUserPreferencesFactory defaultUserPreferencesFactory;

    DefaultUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.defaultUserPreferencesFactory = new DefaultUserPreferencesFactory();
    }

    @Override
    @Transactional
    public UserView createUser(CreateUserCommand command) {
        String normalizedEmail = UserMapper.normalizeEmail(command.email());
        validateEmailIsAvailable(normalizedEmail);

        User user = UserMapper.toNewEntity(command, normalizedEmail);
        user.definePreferences(defaultUserPreferencesFactory.create());

        User savedUser = userRepository.saveAndFlush(user);
        return UserMapper.toView(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserView> listUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toView)
                .toList();
    }

    private void validateEmailIsAvailable(String normalizedEmail) {
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new UserEmailAlreadyInUseException(normalizedEmail);
        }
    }
}
