package util

import (

	"github.com/gin-gonic/gin"
)

type APIError struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}

func HandleError(c *gin.Context, status int, message, code string) {
	c.AbortWithStatusJSON(status, APIError{
		Error: message,
		Code:  code,
	})
}
