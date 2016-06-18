package glougloumiammiam;

import javax.jdo.annotations.*;

@PersistenceCapable
public class HighScores {
	
	@PrimaryKey
	@Persistent
	private String googleId;
	@Persistent
	private String nickName;
	@Persistent
	private int score;
	

	public String getGoogleId() {
		return googleId;
	}

	public String getNickName() {
		return nickName;
	}

	public int getScore() {
		return score;
	}

	public void setGoogleId(String googleId) {
		this.googleId = googleId;
	}

	public void setNickName(String nickName) {
		this.nickName = nickName;
	}

	public void setScore(int score) {
		this.score = score;
	}

	public HighScores(String googleId, String nickName, int score) {
		super();
		this.googleId = googleId;
		this.nickName = nickName;
		this.score = score;
	}

	
	
	

}
