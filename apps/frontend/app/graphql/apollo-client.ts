// graphql/apollo-client.js
import { ApolloClient, InMemoryCache, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import {jwtDecode} from "jwt-decode"; 
import { createUploadLink } from "apollo-upload-client";

const httpUploadLink = createUploadLink({
  uri: "https://backend-mercado-de-obra-beded3gsgrcedghq.brazilsouth-01.azurewebsites.net/graphqll",
  credentials: "include",
  headers: {
    "apollo-require-preflight": "true",
  },
});

// Defina a interface para o payload do JWT, se necessário
interface JwtPayload {
  exp?: number;
  // Adicione outros campos conforme seu token
}

function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded?.exp ? decoded.exp > Math.floor(Date.now() / 1000) : false;
  } catch {
    return false;
  }
}

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

  if (token && isTokenValid(token)) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    };
  }

  // Remove o token inválido
  if (typeof window !== 'undefined') {
    localStorage.removeItem("accessToken");
  }
  return { headers };
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      if (error.message.includes("Unauthorized")) {
        console.error("Token expirado ou inválido. Faça login novamente.");
        if (typeof window !== 'undefined') {
          localStorage.removeItem("accessToken");
        }
      }
    });
  }
});

export function createApolloClient() {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpUploadLink]),
    cache: new InMemoryCache({ addTypename: false }),
  });
}
