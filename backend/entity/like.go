// entity/like.go
package entity

import "gorm.io/gorm"

type Like struct {
    gorm.Model
    UID uint `json:"uid" gorm:"column:u_id;uniqueIndex:uid_wid_unique"`
    WID uint `json:"wid" gorm:"column:w_id;uniqueIndex:uid_wid_unique"`
}

func (Like) TableName() string { return "likes" }