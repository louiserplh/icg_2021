import com.sun.net.httpserver.HttpServer;

import java.io.OutputStream;
import java.net.InetSocketAddress;

public class JavaServer {

    private static int port = 3333;

    public static void main(String[] args) {
        try {
            HttpServer server=HttpServer.create(new InetSocketAddress(port), 0);

            server.createContext("/", httpExchange ->
            {
                String s = httpExchange.getRequestURI().getQuery();
                byte response[]="Hello, World!".getBytes("UTF-8");

                if(parseAndCall(s)) {
                    httpExchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
                    httpExchange.sendResponseHeaders(200, response.length);

                    OutputStream out=httpExchange.getResponseBody();
                    out.write(response);
                    out.close();
                }
            });

            server.start();
        }
        catch(Exception e) {
            e.printStackTrace();
        }
    }

    private static boolean parseAndCall(String s) {


    }

}