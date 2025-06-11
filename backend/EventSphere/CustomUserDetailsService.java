import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Aqui, você busca os dados do usuário do banco de dados (ou outra fonte)
        // Substitua pelo código para buscar o usuário (ex: via JPA, JDBC, etc.)
        if ("admin".equals(username)) {
            // Exemplo de um usuário hardcoded (substitua isso pelo que vier do banco)
            return org.springframework.security.core.userdetails.User.withUsername(username)
                    .password("$2a$10$Wz9XHkX8lQoShdb0AJR9D.THH.CA2dxOKRCIdF8LFCMHxN5XFZRMO") // senha codificada (bcrypt)
                    .roles("ADMIN") // Defina as roles do usuário
                    .build();
        }
        throw new UsernameNotFoundException("Usuário não encontrado: " + username);
    }
}