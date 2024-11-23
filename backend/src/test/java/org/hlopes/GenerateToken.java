package org.hlopes;

import io.quarkus.logging.Log;
import io.smallrye.jwt.build.Jwt;
import org.eclipse.microprofile.jwt.Claims;

import java.util.Set;

public class GenerateToken {
    public static void main(String[] args) {
        String token = Jwt.issuer("https://example.com/issuer")
                          .upn("jow@quarkus.io")
                          .groups(Set.of("User", "Admin"))
                          .claim(Claims.birthdate.name(), "2001-07-13").sign();

        Log.info("### " + token);
    }
}
