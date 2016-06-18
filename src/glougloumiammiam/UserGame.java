/*
package glougloumiammiam;

//import com.googlecode.objectify.annotation.*;
import javax.jdo.annotations.*;

@PersistenceCapable
public class UserGame {
	
	@PrimaryKey
	@Persistent
	private String googleId;
	@Persistent
	private String email;
	@Persistent
	private String nickName;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private int highScore;
	@Persistent
	@Extension(vendorName="datanucleus", key="gae.unindexed", value="true")
	private int lastScore;
	
	public UserGame(String googleId, String email, String nickName, int highScore, int lastScore) {
		super();
		this.googleId = googleId;
		this.email = email;
		this.nickName = nickName;
		this.highScore = highScore;
		this.lastScore = lastScore;
	}
	
	public String getGoogleId() {
		return googleId;
	}
	public String getEmail() {
		return email;
	}
	public String getNickName() {
		return nickName;
	}
	public int getHighScore() {
		return highScore;
	}
	public int getLastScore() {
		return lastScore;
	}
	public void setGoogleId(String googleId) {
		this.googleId = googleId;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public void setNickName(String nickName) {
		this.nickName = nickName;
	}
	public void setHighScore(int highScore) {
		this.highScore = highScore;
	}
	public void setLastScore(int lastScore) {
		this.lastScore = lastScore;
	}
	
	
}
*/

	