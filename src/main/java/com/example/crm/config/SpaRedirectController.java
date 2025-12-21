package com.example.crm.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController implements ErrorController {

    @RequestMapping("/error")
    public String handleError() {
        // forward to home page so that angular routing is preserved.
        return "forward:/index.html";
    }
}
